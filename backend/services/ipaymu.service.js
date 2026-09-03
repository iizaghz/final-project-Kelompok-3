const crypto = require('crypto');
const axios = require('axios');
const config = require('../config/env');

/**
 * Helper untuk membuat Signature HMAC-SHA256 iPaymu API v2
 */
const generateSignature = (body, method = 'POST') => {
  const va = config.ipaymuVa;
  const apiKey = config.ipaymuApiKey;

  const jsonBody = JSON.stringify(body);
  const bodyHash = crypto.createHash('sha256').update(jsonBody).digest('hex').toLowerCase();
  const stringToSign = `${method.toUpperCase()}:${va}:${bodyHash}:${apiKey}`;
  
  return crypto.createHmac('sha256', apiKey).update(stringToSign).digest('hex');
};

/**
 * Helper untuk mengekstrak Base64 Image dari URL QrImage iPaymu
 */
const resolveQrImageUrl = async (qrImageUrl, qrString) => {
  if (!qrImageUrl) {
    return qrString 
      ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`
      : '';
  }

  try {
    const res = await axios.get(qrImageUrl, { timeout: 8000 });
    const html = String(res.data);
    const match = html.match(/src=["'](data:image\/[^"']+)["']/i);
    
    if (match && match[1]) {
      return match[1]; // Kembalikan 'data:image/png;base64,...' yang bisa langsung dirender di <img src="..." />
    }
  } catch (err) {
    console.warn('Gagal fetch raw base64 dari iPaymu QrImage:', err.message);
  }

  // Fallback jika fetch HTML gagal: generate QR code dari string payload
  if (qrString) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`;
  }

  return qrImageUrl;
};

/**
 * Membuat transaksi Direct Dynamic QRIS ke iPaymu
 * @param {Object} param0 
 * @param {string} param0.name
 * @param {string} param0.phone
 * @param {string} param0.email
 * @param {number} param0.amount
 * @param {string} param0.referenceId
 */
const createQrisPayment = async ({ name, phone = '08123456789', email = 'pelanggan@kopisenja.com', amount, referenceId }) => {
  // Jika kredensial iPaymu belum diatur, sediakan mock response untuk kemudahan testing lokal
  if (!config.ipaymuVa || !config.ipaymuApiKey) {
    console.warn('⚠️ IPAYMU_VA / IPAYMU_API_KEY belum diatur. Menggunakan mode Mock QRIS Simulator.');
    return {
      success: true,
      isMock: true,
      transactionId: `MOCK-${Date.now()}`,
      referenceId,
      amount,
      qrImage: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=KOPI-SENJA-MOCK-PAYMENT-${referenceId}`,
      qrString: `00020101021226580016ID.CO.IPAYMU.WWW01189360091100000000000215${referenceId}52045812530336054${amount}5802ID5910KOPI SENJA6007BANDUNG6304MOCK`,
    };
  }

  const payload = {
    name: name || 'Pelanggan Kopi Senja',
    phone: phone || '081234567890',
    email: email || 'order@kopisenja.com',
    amount: Number(amount),
    notifyUrl: config.ipaymuNotifyUrl,
    referenceId: String(referenceId),
    paymentMethod: 'qris',
    paymentChannel: 'mpm',
  };

  try {
    const signature = generateSignature(payload, 'POST');
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);

    const response = await axios.post(config.ipaymuUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'va': config.ipaymuVa,
        'signature': signature,
        'timestamp': timestamp,
      },
      timeout: 10000,
    });

    const resData = response.data;

    if (resData.Status === 200 && resData.Data) {
      const rawQrImage = resData.Data.QrImage || resData.Data.QrTemplate;
      const rawQrString = resData.Data.QrString || resData.Data.PaymentNo;
      
      // Selesaikan URL gambar QR (ekstrak Base64 atau format gambar nyata)
      const resolvedImage = await resolveQrImageUrl(rawQrImage, rawQrString);

      return {
        success: true,
        isMock: false,
        transactionId: resData.Data.TransactionId || resData.Data.SessionId,
        referenceId: resData.Data.ReferenceId || referenceId,
        amount: resData.Data.Total || amount,
        qrImage: resolvedImage,
        qrString: rawQrString,
      };
    } else {
      throw new Error(resData.Message || 'Gagal membuat QRIS iPaymu');
    }
  } catch (error) {
    console.error('Error createQrisPayment iPaymu:', error.response?.data || error.message);
    // Fallback ke QRIS renderer agar tampilan pelanggan tidak rusak
    return {
      success: true,
      isMock: true,
      transactionId: `FALLBACK-${Date.now()}`,
      referenceId,
      amount,
      qrImage: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=KOPI-SENJA-FALLBACK-${referenceId}`,
      qrString: `KOPI-SENJA-QRIS-FALLBACK-${referenceId}`,
      warning: error.message,
    };
  }
};

module.exports = {
  createQrisPayment,
  generateSignature,
};
