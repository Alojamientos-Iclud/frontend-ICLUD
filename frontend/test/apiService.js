export async function buscarPropiedades() {
  const url = 'https://airbnb19.p.rapidapi.com/api/v2/searchPropertyByLocation?location=Miami&adults=1&guestFavorite=false&ib=false&currency=USD';
  
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': 'a10f6cd5camshf144cfd7b81f8c7p122fb9jsn40ab087c1943',
      'x-rapidapi-host': 'airbnb19.p.rapidapi.com',
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}