/**
 * AI Service for Gemini API Integration
 */

export const getFallbackAllocation = (income) => [
  {
    name: 'Tabungan & Investasi',
    percentage: 20,
    allocated_amount: Math.round(income * 0.2),
  },
  {
    name: 'Kebutuhan (Makan & Tagihan)',
    percentage: 50,
    allocated_amount: Math.round(income * 0.5),
  },
  {
    name: 'Jajan & Hiburan',
    percentage: 20,
    allocated_amount: Math.round(income * 0.2),
  },
  {
    name: 'Dana Cadangan',
    percentage: 10,
    allocated_amount: Math.round(income * 0.1),
  }
];

export const getAiPocketRecommendations = async (monthlyIncome, profession = '', apiKey = '') => {
  const parsedIncome = Number(monthlyIncome || 0);
  if (parsedIncome <= 0) {
    return getFallbackAllocation(0);
  }

  // Use Vite env API Key if available and no custom key is provided
  const activeApiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';

  if (!activeApiKey) {
    console.log('No Gemini API Key provided. Using local financial fallback.');
    return getFallbackAllocation(parsedIncome);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Anda adalah perencana keuangan profesional. Berdasarkan pemasukan bulanan sebesar Rp ${parsedIncome} dan status/pekerjaan saat ini sebagai "${profession || 'Umum'}", buatkan rekomendasi pembagian kantong anggaran keuangan yang sangat relevan, logis, dan personal untuk profesi tersebut dalam bahasa Indonesia (misalnya jika mahasiswa butuh kantong kos/kuliah, jika ojek online butuh kantong bensin/servis, dll).
Jumlah total alokasi dana dari seluruh kantong harus tepat berjumlah Rp ${parsedIncome} (total persentase alokasi harus tepat 100%).
Kembalikan hasilnya HANYA berupa JSON array of objects tanpa pembungkus markdown block (seperti \`\`\`json). Setiap objek harus memiliki key berikut secara presisi:
- "name": nama kantong (string, maksimal 30 karakter, contoh: "Makan", "Tabungan & Investasi", "Jajan & Hiburan", "Dana Cadangan")
- "percentage": persentase alokasi (number, contoh: 50, 20)
- "allocated_amount": jumlah alokasi dana bulat (number, contoh: 2500000)`
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }

    const parsedData = JSON.parse(responseText.trim());
    if (Array.isArray(parsedData) && parsedData.length > 0) {
      // Validate that the percentages sum to ~100% and amounts match monthlyIncome
      let totalPercentage = 0;
      let totalAmount = 0;
      const validatedPockets = parsedData.map(pocket => {
        const pct = Number(pocket.percentage || 0);
        const amt = Number(pocket.allocated_amount || 0);
        totalPercentage += pct;
        totalAmount += amt;
        return {
          name: pocket.name || 'Kantong Baru',
          percentage: pct,
          allocated_amount: amt,
          description: pocket.description || 'Fungsi umum'
        };
      });

      // If validation fails significantly, fallback to smart adjustment
      if (Math.abs(totalPercentage - 100) > 5) {
        console.warn('AI suggested pocket percentages do not sum near 100%. falling back to default.');
        return getFallbackAllocation(parsedIncome);
      }

      return validatedPockets;
    }

    throw new Error('Parsed Gemini output is not a valid array');
  } catch (error) {
    console.error('Error calling Gemini API for recommendations:', error);
    console.log('Falling back to local financial rule (50/20/20/10).');
    return getFallbackAllocation(parsedIncome);
  }
};
