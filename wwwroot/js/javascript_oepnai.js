async function getQuestion() {
    const categories = document.getElementById("categories").value;
    const schoolLevel = document.getElementById("schoolLevel").value;
    const language = document.getElementById("language").value;
    const systemRole = "admin"; // Assuming this is hardcoded for now

    const prompt = {
        "Role": systemRole,
        "Categories": categories,
        "SchoolLevel": schoolLevel,
        "Language": language
    };

    //const url = "https://localhost:7036/api/GPT/GPTChat";




    let url;

    // Check if running on localhost
    if (window.location.hostname === "localhost") {
        // Local development URL
        url = 'http://localhost:7036/api/GPT/GPTChat';
    } else {
        // Production URL or another environment
        // You need to set up a proper URL that your production environment can access
        url = 'https://giladbronshtein.github.io/OpenAIforVR/api/GPT/GPTChat';
    }








    const params = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(prompt)
    };

    try {
        const response = await fetch(url, params);
        if (response.ok) {
            const responseData = await response.json(); 
            const data = JSON.parse(responseData); // Parse to convert to object
            console.log(data);
            // Proceed if 'data.questions' exists and is an array
            if (Array.isArray(data.questions)) {
                const carouselInner = document.querySelector("#carouselExample .carousel-inner");
                const carouselButtons = document.getElementById("carouselbuttons");
                carouselInner.innerHTML = ''; // Clear previous content

                data.questions.forEach((item, index) => {
                    const carouselItem = document.createElement('div');
                    carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
                    let optionsHtml = '';

                    item.options.forEach((option, optionIndex) => {
                        optionsHtml += `
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="question${index}" id="question${index}option${optionIndex}" value="${option}">
                                <label class="form-check-label" for="question${index}option${optionIndex}">${option}</label>
                            </div>`;
                    });

                    carouselItem.innerHTML = `
                         <div class="card card-narrow">
                                <div class="card-body">
                                    <h5 class="card-title">${item.question}</h5>
                                    <form>${optionsHtml}</form>
                                    <div class="d-flex justify-content-center mt-3">
                                        <button type="button" class="btn btn-success" onclick="checkAnswer('question${index}', '${item.answer}', this)">Submit</button>
                                    </div>
                                </div>
                            </div>`;

                    carouselInner.appendChild(carouselItem);
                    carouselButtons.innerHTML += `  <button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
                                                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                                        <span class="visually-hidden">Previous</span>
                                                    </button>
                                                    <button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
                                                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                                        <span class="visually-hidden">Next</span>
                                                    </button>`;
                });
            }
            else
            {
                console.error('Questions data is missing or not structured as expected:', data);
            }
        }
        else
        {
            console.error('API call failed with status: ', response.status);
        }
    } catch (error) {
        console.error('Fetch error: ', error);
    }
}

//function checkAnswer(questionName, correctAnswer, button) {
//    const selectedOption = document.querySelector(`input[name="${questionName}"]:checked`)?.value;
//    const cardBody = button.closest('.card-body');

//    // Remove any existing alerts first
//    const existingAlerts = cardBody.querySelectorAll('.alert');
//    existingAlerts.forEach(alert => alert.remove());

//    let alertDiv = document.createElement('div');
//    // Initially, do not include 'show' in the class list to set up for fade-in
//    alertDiv.classList.add('alert', 'fade', 'mt-3', 'd-flex', 'align-items-center');
//    alertDiv.setAttribute('role', 'alert');

//    let iconUseLink;
//    let alertMessage;
//    if (selectedOption) {
//        if (selectedOption === correctAnswer) {
//            alertDiv.classList.add('alert-success');
//            iconUseLink = "#check-circle-fill";
//            alertMessage = "Correct answer!";
//        } else {
//            alertDiv.classList.add('alert-danger');
//            iconUseLink = "#exclamation-triangle-fill";
//            alertMessage = "Incorrect answer. Try again!";
//        }
//    } else {
//        alertDiv.classList.add('alert-warning');
//        iconUseLink = "#info-fill";
//        alertMessage = "Please select an option.";
//    }

//    alertDiv.innerHTML = `
//        <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Icon:"><use xlink:href="${iconUseLink}"></use></svg>
//        <div>${alertMessage}</div>
//    `;

//    cardBody.appendChild(alertDiv);

//    // Use a short timeout before adding 'show' to trigger the fade-in effect
//    setTimeout(() => {
//        alertDiv.classList.add('show');
//    }, 10); // A short delay to ensure the element is in the DOM before starting the transition

//    // Automatically remove the alert after some time
//    setTimeout(() => {
//        alertDiv.classList.remove('show'); // Start fade-out effect
//        setTimeout(() => {
//            alertDiv.remove(); // Remove from DOM after fade-out effect
//        }, 150); // Match this timing with your CSS fade-out transition time
//    }, 3000); // Adjust time as needed for alert to be visible
//}





function checkAnswer(questionName, correctAnswer, button) {
    const selectedOption = document.querySelector(`input[name="${questionName}"]:checked`)?.value;

    // Remove any existing alerts and overlays first
    const existingAlertOverlay = document.querySelector('.alert-overlay');
    if (existingAlertOverlay) existingAlertOverlay.remove();

    // Create an overlay div that will serve as the backdrop for the alert and background dimming
    let alertOverlay = document.createElement('div');
    alertOverlay.classList.add('alert-overlay');
    alertOverlay.style.position = 'fixed';
    alertOverlay.style.top = '0';
    alertOverlay.style.left = '0';
    alertOverlay.style.width = '100%';
    alertOverlay.style.height = '100%';
    alertOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    alertOverlay.style.zIndex = '1040';
    alertOverlay.style.opacity = '0';
    alertOverlay.style.transition = 'opacity 0.3s ease-in-out';
    document.body.appendChild(alertOverlay);

    // Create the alert div that will contain the message
    let alertDiv = document.createElement('div');
    alertDiv.classList.add('alert', 'fade', 'mt-3', 'd-flex', 'align-items-center', 'justify-content-center');
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '50%';
    alertDiv.style.left = '50%';
    alertDiv.style.transform = 'translate(-50%, -50%)';
    alertDiv.style.minWidth = '300px';
    alertDiv.style.zIndex = '1050';
    alertDiv.setAttribute('role', 'alert');

    let iconUseLink;
    let alertMessage;
    if (selectedOption) {
        if (selectedOption === correctAnswer) {
            alertDiv.classList.add('alert-success');
            iconUseLink = "#check-circle-fill";
            alertMessage = "Correct answer!";
        } else {
            alertDiv.classList.add('alert-danger');
            iconUseLink = "#exclamation-triangle-fill";
            alertMessage = "Incorrect answer. Try again!";
        }
    } else {
        alertDiv.classList.add('alert-warning');
        iconUseLink = "#info-fill";
        alertMessage = "Please select an option.";
    }

    alertDiv.innerHTML = `
        <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="${iconUseLink}"></use></svg>
        <div>${alertMessage}</div>
    `;

    // Append the alert div on top of the overlay
    alertOverlay.appendChild(alertDiv);

    // Fade in the overlay and then the alert div
    setTimeout(() => {
        alertOverlay.style.opacity = '1';
        alertDiv.classList.add('show');
    }, 10);

    // Fade out and remove the alert and overlay after some time
    setTimeout(() => {
        alertOverlay.style.opacity = '0';
        alertDiv.classList.remove('show');
        // Remove the alert div and overlay after the fade-out transition
        setTimeout(() => {
            alertOverlay.remove();
        }, 300); // This time should match the transition duration
    }, 1800); // Alert visible for 1.5 seconds
}


















//clearQuestions() to clear all cards
function clearQuestions() {
    const questionsListGroup = document.getElementById("questionsListGroup");
    questionsListGroup.innerHTML = "";
}

//DALL-E
async function getImage() {
    const title = document.getElementById('courseTitle').value;

    const prompt = {
        "CourseTitle": title
    }

    const url = "https://localhost:7036/api/GPT/Dalle"

    const params = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(prompt)
    }

    const response = await fetch(url, params);
    if (response.ok) {
        const data = await response.json();
        const image = document.getElementById("generatedImage");
        image.setAttribute("src", data);

    } else {
        console.log(errors);
    }
};

//Bored AI
async function getActivity() {
    const response = await fetch("https://localhost:7036/api/Bored");
    const data = await response.json();
    const activity = document.getElementById("activity");
    activity.innerHTML = data.activity;
    await getActivityImage();
};

async function getActivityImage() {
    const title = document.getElementById("activity").innerText;

    const prompt = {
        "CourseTitle": title
    }

    const url = "https://localhost:7036/api/GPT/Dalle"

    const params = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(prompt)
    }

    const response = await fetch(url, params);
    if (response.ok) {
        const data = await response.json();
        const image = document.getElementById("activityImage");
        image.setAttribute("src", data);
    } else {
        console.error('API call failed with status: ', response.status);
        // Improved error logging
        response.text().then(text => {
            console.error('Error response body:', text);
        });
    }
};
