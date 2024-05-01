const OPENAI_API_KEY =
  "sk-proj-CqT8tPqiw97FvdTa8NaaT3BlbkFJP8EMo0Oqdf06WfQ2Xelf";

let isImageGenerating = false;

const formElement = document.querySelector(".generateForm");
const galleryElement = document.querySelector(".gallerySection");

const updateCard = (imgData) => {
  imgData.forEach((imgObject, index) => {
    const cardElement = galleryElement.querySelectorAll(".imageCard")[index];
    const imageElement = cardElement.querySelector("img");
    const downloadElement = cardElement.querySelector(".downloadButton");

    // Utilise la source récupéré depuis l'API
    const imgGenerated = `data:image/jpeg;base64,${imgObject.b64_json}`;
    imageElement.src = imgGenerated;

    // Supprime l'état de chargement applique les attribus pour dwnld
    imageElement.onload = () => {
      cardElement.classList.remove("loading");
      downloadElement.setAttribute("href", imgGenerated);
      downloadElement.setAttribute("donwload", `${new Date().getTime()}.jpg`);
    };
  });
};

const generateImages = async (userPrompt, userImageQuantity) => {
  try {
    // Envoie une requette à l'API d'OpenAI
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: userPrompt,
          n: parseInt(userImageQuantity),
          size: "512x512",
          response_format: "b64_json",
        }),
      }
    );
    if (!response.ok) {
      throw new Error(
        "Impossible de générer les images ! Réessayez plus tard."
      );
    }
    const { data } = await response.json();
    updateCard([...data]);
  } catch (error) {
    alert(error.message);
    console.log(error);
  } finally {
    isImageGenerating = false;
  }
};

const handleSubmitForm = (event) => {
  event.preventDefault();

  if (isImageGenerating) {
    return (isImageGenerating = true);
  }

  // Récupération des valeurs de l'U
  const userPrompt = event.srcElement[0].value;
  const userImageQuantity = event.srcElement[1].value;

  // Création d'une balise (lorsque les cards chargent)
  const imgCardBeacon = Array.from({ length: userImageQuantity }, () => {
    return `
    <div class="imageCard loading">
      <img src="images/loading.svg" alt="image généré" />
      <a href="#" class="downloadButton">
        <img src="images/download.svg" alt="download icon" />
      </a>
    </div>`;
  }).join("");

  galleryElement.innerHTML = imgCardBeacon;
  generateImages(userPrompt, userImageQuantity);
};

formElement.addEventListener("submit", handleSubmitForm);
