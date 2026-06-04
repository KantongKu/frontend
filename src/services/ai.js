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

export const getAiPocketSuggestion = async (pocketName, monthlyIncome, profession = '', apiKey = '') => {
  const parsedIncome = Number(monthlyIncome || 0);
  const activeApiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';

  const fallbackLimit = Math.round(parsedIncome * 0.20);
  const fallbackReason = '20% dari pendapatan bulanan Anda (alokasi tabungan standar).';

  if (!pocketName.trim()) {
    return {
      suggested_limit: fallbackLimit,
      reason: 'Nama kantong kosong. AI menyarankan alokasi 20% sebagai default.'
    };
  }

  if (!activeApiKey) {
    console.log('No Gemini API Key provided for single suggestion. Using local calculation.');
    return {
      suggested_limit: fallbackLimit,
      reason: fallbackReason
    };
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
                  text: `Anda adalah asisten perencana keuangan pribadi. Berdasarkan pendapatan bulanan sebesar Rp ${parsedIncome}, pekerjaan/profesi sebagai "${profession || 'Umum'}", dan nama kantong anggaran keuangan yang akan dibuat/diubah yaitu "${pocketName}", berikan rekomendasi jumlah target limit anggaran bulanan yang rasional untuk kantong tersebut dalam mata uang Rupiah.
Kembalikan hasilnya HANYA berupa JSON object dengan key berikut secara presisi:
- "suggested_limit": jumlah anggaran yang disarankan dalam angka bulat (number, contoh: 1000000)
- "reason": penjelasan singkat (maksimal 150 karakter) dalam bahasa Indonesia tentang mengapa jumlah ini disarankan (misalnya "10% dari gaji bulanan Anda untuk pos traveling agar keuangan tetap stabil.")`
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
    if (parsedData && parsedData.suggested_limit !== undefined) {
      return {
        suggested_limit: Number(parsedData.suggested_limit),
        reason: parsedData.reason || 'Berdasarkan analisis AI.'
      };
    }

    throw new Error('Parsed output does not contain suggested_limit');
  } catch (error) {
    console.error('Error getting single AI suggestion:', error);
    return {
      suggested_limit: fallbackLimit,
      reason: fallbackReason
    };
  }
};

export const parseAiTransactions = async (textInput, pocketsList, isMultiple = false, apiKey = '') => {
  const activeApiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';

  // Prepare pocket list info for the prompt
  const pocketInfo = pocketsList.map(p => `- ID: ${p.id}, Nama: "${p.title}"`).join('\n');

  // Local fallback parsing function
  const parseLocalFallback = (text, pockets) => {
    const lines = isMultiple ? text.split('\n').filter(l => l.trim()) : [text];
    return lines.map(line => {
      const trimmed = line.trim();
      const lowerLine = trimmed.toLowerCase();
      // Extract amount
      let amount = 0;
      // Match numbers like 50rb, 3jt, 50.000, 50000, etc.
      // 1. match number with rb/jt suffix
      const suffixMatch = trimmed.match(/(\d+(?:[.,]\d+)?)\s*(rb|ribu|jt|juta)/i);
      if (suffixMatch) {
        let val = parseFloat(suffixMatch[1].replace(',', '.'));
        const unit = suffixMatch[2].toLowerCase();
        if (unit.startsWith('r')) {
          amount = val * 1000;
        } else if (unit.startsWith('j')) {
          amount = val * 1000000;
        }
      } else {
        // match plain numbers with optional dots/commas
        const plainNumberMatch = trimmed.match(/\b\d+(?:[.]\d{3})*(?:[,,]\d+)?\b/);
        if (plainNumberMatch) {
          amount = parseInt(plainNumberMatch[0].replace(/[.]/g, ''), 10);
        } else {
          // any digits
          const digitMatch = trimmed.match(/\d+/);
          if (digitMatch) {
            amount = parseInt(digitMatch[0], 10);
          }
        }
      }

      // Determine type
      let type = 'expense';
      const incomeKeywords = ['gaji', 'bonus', 'dapat', 'terima', 'pemasukan', 'income', 'saham', 'dividen', 'cuan', 'transferan masuk', 'transfer masuk'];
      if (incomeKeywords.some(kw => lowerLine.includes(kw))) {
        type = 'income';
      }

      // Match pocket
      let wallet_id = pockets.length > 0 ? pockets[0].id : null; // default to first pocket
      let bestMatchScore = 0;

      // 1. Clean token matching (stripping parenthesis and other special characters)
      for (const pocket of pockets) {
        const cleanTitle = pocket.title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
        const tokens = cleanTitle.split(/\s+/).filter(t => t.length > 2);
        
        let score = 0;
        tokens.forEach(token => {
          if (lowerLine.includes(token)) {
            score += token.length * 2;
          }
        });
        if (score > bestMatchScore) {
          bestMatchScore = score;
          wallet_id = pocket.id;
        }
      }

      // 2. Fallback smart synonyms/category rules if no direct keyword match
      if (bestMatchScore === 0 && pockets.length > 0) {
        const categoryRules = [
          {
            keywords: ['makan', 'minum', 'kopi', 'cafe', 'restoran', 'warung', 'food', 'beverage', 'grocery', 'belanja bulanan', 'sayur', 'beras', 'indomaret', 'alfamart', 'nasi', 'bakso', 'mie', 'kenangan', 'starbucks', 'gofood', 'grabfood', 'shopeefood'],
            pocketKeywords: ['makan', 'kuliner', 'kebutuhan', 'jajan']
          },
          {
            keywords: ['bensin', 'pertalite', 'pertamax', 'servis', 'oli', 'gojek', 'grab', 'gocar', 'uber', 'bus', 'kereta', 'tiket', 'transport', 'parkir', 'tol', 'angkutan', 'ojek'],
            pocketKeywords: ['transport', 'kendaraan', 'bensin', 'kebutuhan']
          },
          {
            keywords: ['kost', 'kos', 'kontrakan', 'listrik', 'air', 'pdam', 'wifi', 'internet', 'pulsa', 'kuota', 'langganan', 'netflix', 'spotify', 'tagihan', 'token'],
            pocketKeywords: ['tagihan', 'utilitas', 'kebutuhan', 'kost', 'bulanan']
          },
          {
            keywords: ['tabungan', 'investasi', 'reksa dana', 'saham', 'crypto', 'emas', 'deposito', 'simpanan', 'celengan', 'reksadana', 'bibit'],
            pocketKeywords: ['tabungan', 'investasi', 'simpan']
          },
          {
            keywords: ['jajan', 'nonton', 'bioskop', 'singing', 'karaoke', 'main', 'game', 'steam', 'topup', 'skin', 'liburan', 'jalan-jalan', 'travel', 'hotel', 'wisata', 'healing', 'belanja baju', 'sepatu'],
            pocketKeywords: ['jajan', 'hiburan', 'refreshing', 'wisata', 'senang']
          },
          {
            keywords: ['sakit', 'obat', 'dokter', 'klinik', 'apotek', 'rawat', 'sehat', 'darurat', 'musibah', 'kecelakaan', 'emergency', 'asuransi', 'bpjs'],
            pocketKeywords: ['cadangan', 'darurat', 'kesehatan', 'obat', 'emergency']
          }
        ];

        let matchedPocketIndex = -1;
        let matchedRuleIndex = -1;

        for (let rIdx = 0; rIdx < categoryRules.length; rIdx++) {
          const rule = categoryRules[rIdx];
          if (rule.keywords.some(kw => lowerLine.includes(kw))) {
            matchedRuleIndex = rIdx;
            break;
          }
        }

        if (matchedRuleIndex !== -1) {
          const targetPocketKeywords = categoryRules[matchedRuleIndex].pocketKeywords;
          let bestPocketScore = 0;
          for (let pIdx = 0; pIdx < pockets.length; pIdx++) {
            const p = pockets[pIdx];
            const pTitleLower = p.title.toLowerCase();
            let pScore = 0;
            targetPocketKeywords.forEach(pKw => {
              if (pTitleLower.includes(pKw)) {
                pScore += pKw.length;
              }
            });
            if (pScore > bestPocketScore) {
              bestPocketScore = pScore;
              matchedPocketIndex = pIdx;
            }
          }
        }

        if (matchedPocketIndex !== -1) {
          wallet_id = pockets[matchedPocketIndex].id;
        } else {
          // If no categories match, look for a pocket title containing 'kebutuhan' or 'makan'
          const kebutuhanPocket = pockets.find(p => p.title.toLowerCase().includes('kebutuhan') || p.title.toLowerCase().includes('makan'));
          if (kebutuhanPocket) {
            wallet_id = kebutuhanPocket.id;
          } else {
            // Find a pocket that is NOT investment/savings
            const nonInvestPocket = pockets.find(p => !p.title.toLowerCase().includes('investasi') && !p.title.toLowerCase().includes('tabungan'));
            if (nonInvestPocket) {
              wallet_id = nonInvestPocket.id;
            }
          }
        }
      }

      // Description (remove the numeric amount and any rb/jt suffix, clean up)
      let description = trimmed;
      if (suffixMatch) {
        description = description.replace(suffixMatch[0], '');
      } else {
        const numMatch = trimmed.match(/\b\d+(?:[.]\d{3})*(?:[,,]\d+)?\b/);
        if (numMatch) {
          description = description.replace(numMatch[0], '');
        }
      }
      // clean up punctuation and excess spaces
      description = description.replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
      if (!description) {
        description = type === 'income' ? 'Pemasukan Lainnya' : 'Pengeluaran Lainnya';
      }

      return {
        description,
        amount,
        type,
        wallet_id
      };
    });
  };

  if (!activeApiKey) {
    console.log('No Gemini API Key. Using local parser fallback.');
    return parseLocalFallback(textInput, pocketsList);
  }

  try {
    const promptText = `Anda adalah asisten AI parsing keuangan untuk aplikasi pencatat anggaran KantongKu.
Tugas Anda adalah mengurai teks masukan mentah dari pengguna menjadi terstruktur dalam format JSON.
Berikut adalah daftar Kantong (Pockets) yang dimiliki pengguna saat ini:
${pocketInfo || 'Tidak ada kantong'}

Teks masukan pengguna:
"${textInput}"

Aturan Pemrosesan:
1. Jika parameter 'isMultiple' bernilai ${isMultiple}, Anda harus memproses teks tersebut ${isMultiple ? 'sebagai beberapa transaksi terpisah (parse baris per baris atau entitas transaksi yang berbeda)' : 'sebagai satu buah transaksi tunggal'}.
2. Ekstrak key berikut untuk setiap transaksi:
   - "description": deskripsi/nama transaksi (string, hilangkan nominal uang dari deskripsi ini, contoh: "kopi kenangan")
   - "amount": nominal transaksi (number, hilangkan desimal dan buat dalam angka bulat penuh, konversikan singkatan seperti "rb" -> 1000, "jt" -> 1000000, contoh: "50rb" menjadi 50000, "1.5jt" menjadi 1500000)
   - "type": jenis transaksi ("expense" untuk pengeluaran, "income" untuk pemasukan, tebak dengan cerdas dari konteks kata, contoh "gaji" atau "terima" adalah "income", "beli" atau "bayar" adalah "expense")
   - "wallet_id": ID kantong dari daftar kantong di atas yang paling relevan dengan transaksi ini (number). Jika tidak ada kantong yang cocok secara spesifik, pilih ID kantong jajan/pengeluaran umum atau kantong pertama dari daftar. Jika daftar kantong kosong, berikan null.

Kembalikan hasilnya HANYA berupa JSON array of objects tanpa pembungkus markdown block (seperti \`\`\`json\`). Format output harus tepat seperti ini:
[
  {
    "description": "...",
    "amount": ...,
    "type": "...",
    "wallet_id": ...
  }
]`;

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
                  text: promptText
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
    if (Array.isArray(parsedData)) {
      return parsedData.map(tx => ({
        description: tx.description || 'Transaksi AI',
        amount: Number(tx.amount || 0),
        type: tx.type === 'income' ? 'income' : 'expense',
        wallet_id: tx.wallet_id ? Number(tx.wallet_id) : (pocketsList.length > 0 ? pocketsList[0].id : null)
      }));
    }

    throw new Error('Parsed output is not an array');
  } catch (error) {
    console.error('Error parsing AI transactions, using local fallback:', error);
    return parseLocalFallback(textInput, pocketsList);
  }
};


