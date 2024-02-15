const axios = require('axios');
const fs = require('fs').promises;

async function generarDataset(apiKey, numeroPeliculas, nombreArchivo) {
    // Lista de géneros
    const generos = [28, 35, 18, 12, 878]; // Códigos de géneros en TMDb: Acción, Comedia, Drama, Aventura, Ciencia ficción

    // Array para almacenar el dataset
    const dataset = [];

    // Bucle para generar las entradas del dataset
    for (let i = 0; i < numeroPeliculas; i++) {
        // Generar un género aleatorio
        const generoAleatorio = generos[Math.floor(Math.random() * generos.length)];
        const usuarioAleatorio = `Usuario${Math.floor(Math.random() * 20) + 1}`;

        try {
            // Obtener una lista de películas aleatorias del género seleccionado
            const respuesta = await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${generoAleatorio}`);
            const peliculas = respuesta.data.results;

            // Elegir una película aleatoria de la lista obtenida
            const peliculaAleatoria = peliculas[Math.floor(Math.random() * peliculas.length)];

            // Agregar la entrada al dataset
            dataset.push({
                usuario: usuarioAleatorio,
                item: {
                    titulo: peliculaAleatoria.title,
                    descripcion: peliculaAleatoria.overview,
                    adulto: peliculaAleatoria.adult,
                    fondo: peliculaAleatoria.backdrop_path,
                    generos: peliculaAleatoria.genre_ids,
                    id: peliculaAleatoria.id,
                    idioma_original: peliculaAleatoria.original_language,
                    titulo_original: peliculaAleatoria.original_title,
                    popularidad: peliculaAleatoria.popularity,
                    poster: peliculaAleatoria.poster_path,
                    fecha_lanzamiento: peliculaAleatoria.release_date,
                    video: peliculaAleatoria.video,
                    calificacion: peliculaAleatoria.vote_average,
                    numero_votos: peliculaAleatoria.vote_count,
                },
                description: peliculaAleatoria.overview,
                calificacion: Math.floor(Math.random() * 5) + 1,
            });

            // console.log(`Generando entrada ${i + 1} de ${JSON.stringify(peliculaAleatoria)}...`);

        } catch (error) {
            console.error('Error al obtener datos de la API:', error.message);
        }
    }

    // Escribir el dataset en un archivo JSON
    try {
        await fs.writeFile(nombreArchivo, JSON.stringify(dataset, null, 2));
        console.log(`Dataset guardado en ${nombreArchivo}`);
    } catch (error) {
        console.error('Error al escribir el dataset en el archivo:', error.message);
    }
}

// Ejemplo de uso
const apiKey = "d6457739d79b36fbc37f3aead5da67a8"; // Reemplaza "TU_TOKEN_DE_ACCESO" con tu token de acceso de TMDb
const numeroPeliculas = 100;
const nombreArchivo = "dataset.json";

generarDataset(apiKey, numeroPeliculas, nombreArchivo);


