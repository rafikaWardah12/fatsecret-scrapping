const puppeteer = require("puppeteer");
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const finalResults = [];
  const getNeutrint = async (mainUrl) => {
    await page.goto(mainUrl, { waitUntil: "networkidle2" });

    const urlResult = await page.evaluate(() => {
      const urls = document.querySelectorAll(".factPanel")[1]?.nextElementSibling?.nextElementSibling?.querySelectorAll("a");
      if (!urls) {
        return null;
      };

      const convertUrl = [];
      urls.forEach((el, index) => {
        if (index % 2 == 0) {
          convertUrl.push(el.getAttribute("href"))
        }
      })
      return convertUrl;
    });

    const results = [];
    if (!urlResult) {
      console.log(mainUrl)
      return results;
    };

    for (const url of urlResult) {

      await page.goto(`https://www.fatsecret.co.id` + url, { waitUntil: "networkidle2" });

      const result = await page.evaluate(() => {
        const serveText = document.querySelector(".serving_size_value").innerText;
        const data = {
          serving_size: serveText,
        };

        const nutritionValue = document.querySelectorAll(".nutrient.right");
        const nutrition = document.querySelectorAll(".nutrient.left");

        nutrition.forEach((el, index) => {
          if (el.innerText == '') {
            data['Energi'] = nutritionValue[index + 1].innerText;
            return;
          }
          data[el.innerText] = nutritionValue[index + 1].innerText;
        })

        return data;
      });

      results.push({ name: mainUrl.split("/").pop(), ...result })
    }

    return results;
  }

  const urls = [
    "https://www.fatsecret.co.id/kalori-gizi/umum/nasi-kuning",
    "https://www.fatsecret.co.id/kalori-gizi/umum/nasi-goreng",
    "https://www.fatsecret.co.id/kalori-gizi/umum/nasi-pecel",
    "https://www.fatsecret.co.id/kalori-gizi/umum/nasi-putih",
    "https://www.fatsecret.co.id/kalori-gizi/umum/nasi-tiwul",
    "https://www.fatsecret.co.id/kalori-gizi/umum/mie-ayam",
    "https://www.fatsecret.co.id/kalori-gizi/umum/bakso-daging-sapi",
    "https://www.fatsecret.co.id/kalori-gizi/umum/bubur-ayam",
    "https://www.fatsecret.co.id/kalori-gizi/umum/gado-gado",
    "https://www.fatsecret.co.id/kalori-gizi/umum/rujak",
    "https://www.fatsecret.co.id/kalori-gizi/umum/lontong-balap",
    "https://www.fatsecret.co.id/kalori-gizi/umum/ayam-goreng",
    "https://www.fatsecret.co.id/kalori-gizi/umum/ayam-geprek",
    "https://www.fatsecret.co.id/kalori-gizi/umum/daging-ayam-(panggang-bakar-dimasak)",
    "https://www.fatsecret.co.id/kalori-gizi/umum/telur-dadar",
    "https://www.fatsecret.co.id/kalori-gizi/umum/telur-ceplok",
    "https://www.fatsecret.co.id/kalori-gizi/umum/telur-rebus",
    "https://www.fatsecret.co.id/kalori-gizi/umum/sate-kerang",
    "https://www.fatsecret.co.id/kalori-gizi/umum/lele-goreng",
    "https://www.fatsecret.co.id/kalori-gizi/umum/rendang",
    "https://www.fatsecret.co.id/kalori-gizi/umum/sate-ayam",
    "https://www.fatsecret.co.id/kalori-gizi/umum/kering-tempe",
    "https://www.fatsecret.co.id/kalori-gizi/umum/tempe-goreng",
    "https://www.fatsecret.co.id/kalori-gizi/umum/tempe-bacem",
    "https://www.fatsecret.co.id/kalori-gizi/umum/perkedel-kentang",
    "https://www.fatsecret.co.id/kalori-gizi/umum/pepes-tahu",
    "https://www.fatsecret.co.id/kalori-gizi/umum/terong-balado",
    "https://www.fatsecret.co.id/kalori-gizi/umum/tumis-kangkung",
    "https://www.fatsecret.co.id/kalori-gizi/umum/urap",
    "https://www.fatsecret.co.id/kalori-gizi/umum/soto-ayam",
    "https://www.fatsecret.co.id/kalori-gizi/umum/sayur-lodeh",
    "https://www.fatsecret.co.id/kalori-gizi/umum/cap-cay-kuah",
    "https://www.fatsecret.co.id/kalori-gizi/umum/rawon",
    "https://www.fatsecret.co.id/kalori-gizi/umum/sup-sayur-vegetarian-(disiapkan-dengan-air)",
    "https://www.fatsecret.co.id/kalori-gizi/umum/sayur-asem",
    "https://www.fatsecret.co.id/kalori-gizi/umum/kerupuk-putih",
    "https://www.fatsecret.co.id/kalori-gizi/uleg/sambal-pedas",
    "https://www.fatsecret.co.id/kalori-gizi/umum/petis",
    "https://www.fatsecret.co.id/kalori-gizi/anget-sari/wedang-jahe/1-sachet",
    "https://www.fatsecret.co.id/kalori-gizi/umum/ikan-mujair-goreng",
    "https://www.fatsecret.co.id/kalori-gizi/umum/kupat-tahu",
  ];

  for (const url of urls) {
    const results = await getNeutrint(url);

    finalResults.push(results);
  }


  fs.writeFileSync("data.json", JSON.stringify(finalResults))
  await browser.close();
})()