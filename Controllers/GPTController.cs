using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Prog3_WebApi_Javascript.DTOs;

namespace Prog3_WebApi_Javascript.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GPTController : ControllerBase
    {
        private readonly HttpClient _client;
        public GPTController(IConfiguration config)
        {
            // Initialize the private HttpClient instance
            _client = new HttpClient();

            // Retrieve the API key from the configuration settings
            string api_key = config.GetValue<string>("OpenAI:Key");

            // Create the authorization header using the API key
            string auth = "Bearer " + api_key;

            // Add the authorization header to the default request headers of the HttpClient instance
            _client.DefaultRequestHeaders.Add("Authorization", auth);
        }

        [HttpPost("GPTChat")]
        public async Task<IActionResult> GPTChat(Prompt promptFromUser)
        {
            // API endpoint for OpenAI GPT
            string endpoint = "https://api.openai.com/v1/chat/completions";

            // Specifies the model to use for chat completions (GPT-3.5 Turbo)
            string model = "gpt-3.5-turbo-0125";

            // Temperature parameter for the model
            double temperature = 1;

            // Maximum number of tokens in the generated response
            int max_tokens = 320;

            // Other langs seem to demand MORE tokens
            if (promptFromUser.Language != "en")
            {
                max_tokens = 1100;
            }

            string promptToSend = $"Please generate 5 closed questions with 4 answers each, related to the subject of {promptFromUser.Categories}.  " +
                $"The questions should be tailored to the level of {promptFromUser.SchoolLevel} students. Tailored to the language of {promptFromUser.Language}. " +
                $"The questions should be clear at {promptFromUser.Language}, concise, and designed to assess someone's knowledge or understanding of the topic. " +
                $"Keep your answer under 120 characters. Each question will contain 4 answers to pick up and you will mention which of them is the correct one.  " +
                $"Respond in JSON format as follows:" +
                $" {{'questions':[{{'question':'text','options':['a','b','c','d'],'answer':'correct option'}}]}}`. " +
                $"Keep your answer under 120 characters.";
            Console.WriteLine(promptToSend);
            // Construct the promptToSystem to send to the model
            string promptToSystem = "Upon receiving a request, create 5 questions, each with 4 answers. Reply in JSON:" +
                " `{'questions':[{'question':'text','options':['option1','option2','option3','option4'],'answer':'correct option'}]}`. ";

            // Construct the promptToAssistant to send to the model
            string promptToAssistant = "";


            // Create a GPTRequest object to send to the API
            GPTRequest request = new GPTRequest()
            {
                response_format = new { type = "json_object" },
                max_tokens = max_tokens,
                model = model,
                temperature = temperature,
                messages = new List<Message>()
                {
                     new Message
                    {
                        role = "system",
                        content = promptToSystem
                    },
                    //new Message
                    //{
                    //    role = "assistant",
                    //    content = promptToAssistant
                    //},
                    new Message
                    {
                        role = "user",
                        content = promptToSend
                    }
                }
            };

            // Send the GPTRequest object to the OpenAI API
            var res = await _client.PostAsJsonAsync(endpoint, request);

            // Check if the API response indicates an error
            if (!res.IsSuccessStatusCode)
                return BadRequest("problem: " + res.Content.ReadAsStringAsync());

            // Read the JSON response from the API
            JsonObject? jsonFromGPT = res.Content.ReadFromJsonAsync<JsonObject>().Result;
            if (jsonFromGPT == null)
                return BadRequest("empty");

            // Extract the generated content from the JSON response
            string content = jsonFromGPT["choices"][0]["message"]["content"].ToString();

            // Return the generated content
            return Ok(content);
        }

        [HttpPost("Dalle")]
        public async Task<IActionResult> Dalle(ImagePrompt imagePrompt)
        {
            string promptToSend = $"Creative futuristic cover image for a new online course called: {imagePrompt.CourseTitle}.";

            string model = "dall-e-2";

            string size = "256x256";

            DalleRequest request = new DalleRequest()
            {
                prompt = promptToSend,
                model = model,
                size = size
            };


            string endpoint = "https://api.openai.com/v1/images/generations";

            var res = await _client.PostAsJsonAsync(endpoint, request);
            if (!res.IsSuccessStatusCode)
            {
                return BadRequest("problem: " + res.Content.ReadAsStringAsync());
            }

            JsonObject? jsonFromDalle = res.Content.ReadFromJsonAsync<JsonObject>().Result;
            if (jsonFromDalle == null)
            {
                return BadRequest("empty");
            }

            string content = jsonFromDalle["data"][0]["url"].ToString();

            return Ok(content);
        }
    }
}