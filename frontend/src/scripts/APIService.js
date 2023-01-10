class APIService {
  // Insert an article
  static SendData(body, route) {
    return fetch(`/api/${route}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .catch((error) => console.log(error));
  }
}

export default APIService;
