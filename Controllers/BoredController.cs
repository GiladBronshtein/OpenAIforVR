using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Nodes;
using Prog3_WebApi_Javascript.DTOs; 
namespace Prog3_WebApi_Javascript.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BoredController : ControllerBase
    {
        private readonly HttpClient _client;
        public BoredController()
        {
            _client = new HttpClient();

        }
        [HttpGet]
        public async Task<IActionResult> GetUser()
        {
            string endpoint = "http://www.boredapi.com/api/activity";

            var response = await _client.GetAsync(endpoint);

            if (response.IsSuccessStatusCode)
            {
                JsonObject responseContent = response.Content.ReadFromJsonAsync<JsonObject>().Result;

                BoredRequest bored = new BoredRequest();
                bored.activity = responseContent["activity"].ToString();
                //bored.accessibility = responseContent["accessibility"].ToString();
                //bored.activity = responseContent["activity"].ToString();
                //bored.accessibility = responseContent["accessibility"].ToString();
                //bored.activity = responseContent["activity"].ToString();
                //bored.accessibility = responseContent["accessibility"].ToString();


                return Ok(bored);
            }
            return BadRequest("API Call Failed");
        }
    }
}
