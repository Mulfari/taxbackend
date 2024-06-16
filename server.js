const express = require('express');
const { RestClientV5 } = require('bybit-api');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

const client = new RestClientV5({
  key: process.env.API_KEY,
  secret: process.env.SECRET_KEY,
  enable_time_sync: true, // Habilitar sincronización de tiempo
});

// Función para obtener el balance de la cuenta "UNIFIED"
const getUnifiedBalance = async () => {
  try {
    const response = await client.getWalletBalance({ accountType: 'UNIFIED' });
    console.log('API response:', JSON.stringify(response, null, 2)); // Log the full response for inspection
    if (response.result && response.result.list && response.result.list[0] && response.result.list[0].coin) {
      return response.result.list[0].coin;
    } else {
      throw new Error('Unexpected response structure for UNIFIED balance');
    }
  } catch (error) {
    throw new Error(`Error fetching UNIFIED balance: ${error.message}`);
  }
};

// Función para guardar datos en un archivo JSON dentro de la carpeta data
const saveToFile = (data, filename) => {
  const filePath = path.join(__dirname, 'data', filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Endpoint para obtener el balance de la cuenta "UNIFIED" y guardarlo en un archivo JSON
app.get('/api/balance', async (req, res) => {
  try {
    const unifiedBalance = await getUnifiedBalance();
    saveToFile(unifiedBalance, 'balance.json');
    res.json(unifiedBalance);
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
