const mongoose = require('mongoose');

const wineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  winery: { type: String },
  varietal: { type: String },
  price: { type: Number },
  description: { type: String },
  imageUrl: { type: String }
}, { timestamps: true });

const Wine = mongoose.models.Wine || mongoose.model('Wine', wineSchema);

const sampleWines = [
  {
    name: "Rutini Malbec",
    winery: "Rutini Wines",
    varietal: "Malbec",
    price: 18500,
    description: "Vino de gran cuerpo, con notas a frutos rojos maduros, vainilla y un toque especiado por su paso por barrica de roble.",
    imageUrl: "https://tienda.rutiniwines.com/cdn/shop/files/RutiniColeccion-CabernetMalbec_1000x1000_ed98f227-7672-4167-8835-7d5b76f5b079_1000x.png"
  },
  {
    name: "Catena Zapata Cabernet Sauvignon",
    winery: "Catena Zapata",
    varietal: "Cabernet Sauvignon",
    price: 22000,
    description: "Elegante e intenso, con aromas a cassis, pimiento rojo y cacaos oscuros. Taninos firmes y final persistente.",
    imageUrl: "https://www.espaciovino.com.ar/media/default/0001/72/thumb_71052_default_big.jpeg"
  },
  {
    name: "Luigi Bosca Chardonnay",
    winery: "Luigi Bosca",
    varietal: "Chardonnay",
    price: 14200,
    description: "Fresco, frutal y equilibrado, destacando notas de fruta blanca como pera, durazno y un fino toque mantecoso.",
    imageUrl: "https://www.espaciovino.com.ar/media/default/0001/54/thumb_53476_default_big.jpeg"
  },
  {
    name: "El Enemigo Gran Enemigo",
    winery: "Aleanna",
    varietal: "Cabernet Franc",
    price: 45000,
    description: "Un vino de culto con complejidad excepcional, notas minerales, frutos negros y acidez equilibrada.",
    imageUrl: "https://casadevinosmendoza.com.ar/wp-content/uploads/2022/10/Vino-Gran-Enemigo-Gualtallary-Cabernet-Franc-750ml.jpg"
  }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://gooddrinks-mongo:27017/gooddrinks';
    await mongoose.connect(mongoUri);
    console.log('🌱 Conectado a MongoDB...');

    // Limpiamos los anteriores para no duplicar y cargamos los nuevos con imágenes
    await Wine.deleteMany({});
    await Wine.insertMany(sampleWines);
    console.log('🍷 ¡4 Vinos con imágenes creados con éxito!');
  } catch (error) {
    console.error('❌ Error al sembrar vinos:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

seed();