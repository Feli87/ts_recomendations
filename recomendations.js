// Importar las librerías necesarias
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node'); // Si tienes GPU compatible
// require('@tensorflow/tfjs-node'); // Si prefieres usar CPU exclusivamente
const fs = require('fs').promises;

// Definir y entrenar tu modelo de recomendación
async function trainModel() {
    // Cargar y preprocesar tus datos
    const data = await loadData('dataset.json');
    const processedData = preprocessData(data);

    // Definir la arquitectura del modelo
    const model = tf.sequential();
    model.add(tf.layers.dense({units: 64, inputShape: [processedData.inputShape]}));
    model.add(tf.layers.dense({units: 32, activation: 'relu'}));
    model.add(tf.layers.dense({units: processedData.outputShape}));

    // Compilar el modelo
    model.compile({optimizer: 'adam', loss: 'meanSquaredError'});

    // Entrenar el modelo
    const history = await model.fit(processedData.trainX, processedData.trainY, {
        epochs: 10,
        validationData: [processedData.valX, processedData.valY]
    });

    return model;
}

// Cargar los datos del dataset
async function loadData(nombreArchivo) {
    try {
        const contenido = await fs.readFile(nombreArchivo, 'utf-8');
        return JSON.parse(contenido);
    } catch (error) {
        console.error('Error al cargar los datos del archivo:', error.message);
        return null;
    }
}

// Preprocesar los datos
function preprocessData(data) {
    // Convertir los datos a tensores
    const trainX = [];
    const trainY = [];
    const valX = [];
    const valY = [];

    // Iterar sobre los datos y convertirlos a tensores
    data.forEach(entry => {
        const input = entry.item; // Datos de entrada
        const output = entry.calificacion; // Calificación

        // Normalizar los datos de entrada si es necesario
        // Implementar la lógica de normalización aquí si es necesaria

        // Dividir los datos en conjuntos de entrenamiento y validación
        if (Math.random() < 0.8) {
            trainX.push(input);
            trainY.push(output);
        } else {
            valX.push(input);
            valY.push(output);
        }
    });

    // Obtener las formas de los tensores de entrada y salida
    const inputShape = trainX[0].length; // Se asume que todos los datos de entrada tienen la misma longitud
    const outputShape = 1; // Se asume que la salida es un solo número (la calificación)

    // Convertir los arrays de datos a tensores
    const tensorOptions = {dtype: 'float32', shape: [null, inputShape]};
    const tensorOptionsY = {dtype: 'float32', shape: [null, outputShape]};
    const processedData = {
        inputShape: inputShape,
        outputShape: outputShape,
        trainX: tf.tensor2d(trainX, null, tensorOptions),
        trainY: tf.tensor2d(trainY, null, tensorOptionsY),
        valX: tf.tensor2d(valX, null, tensorOptions),
        valY: tf.tensor2d(valY, null, tensorOptionsY)
    };

    return processedData;
}

// Hacer recomendaciones
async function makeRecommendations(inputData) {
    // Cargar tu modelo entrenado
    const model = await trainModel();

    // Procesar los datos de entrada
    const processedInput = preprocessInput(inputData);

    // Realizar predicciones
    const predictions = model.predict(processedInput);

    return predictions;
}

// Procesar los datos de entrada
function preprocessInput(inputData) {
    // Preprocesar los datos de entrada aquí

    // Supongamos que el inputData es un objeto con las características de una película
    // Ejemplo:
    // inputData = { titulo: "Titanic", descripcion: "Una película sobre un barco que se hunde", generos: [18, 10749], idioma_original: "en", fecha_lanzamiento: "1997-12-19" }

    // Codificar las características categóricas, si es necesario
    // Por ejemplo, si tienes una lista de géneros y quieres codificarlos como one-hot vectors:
    const generosDisponibles = [28, 35, 18, 12, 878]; // Supongamos que estos son los códigos de género disponibles
    const generosCodificados = generosDisponibles.map(genero => inputData.generos.includes(genero) ? 1 : 0);

    // Normalizar las características numéricas, si es necesario
    // Por ejemplo, si tienes una fecha de lanzamiento y quieres normalizarla:
    const fechaLanzamiento = new Date(inputData.fecha_lanzamiento);
    const fechaNormalizada = (fechaLanzamiento.getTime() - Date.parse('1970-01-01')) / (24 * 60 * 60 * 1000); // Normalizar la fecha en días desde el 1 de enero de 1970

    // Juntar todas las características en un solo vector
    const inputVector = [
        // Añadir las características codificadas
        ...generosCodificados,
        // Añadir características numéricas
        fechaNormalizada
    ];

    // Devolver los datos de entrada preprocesados
    return inputVector;
}

const inputData = {
    titulo: "Titanic",
    descripcion: "Una película sobre un barco que se hunde",
    generos: [18, 10749], // Códigos de género de la película
    idioma_original: "en",
    fecha_lanzamiento: "1997-12-19"
};
makeRecommendations(inputData).then(predictions => {
    console.log('Recomendaciones:', predictions);
}).catch(error => {
    console.error('Error:', error);
});
