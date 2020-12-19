const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");

const rootURL =
  "http://www.lawcommission.gov.np/np/archives/category/documents/prevailing-law/%e0%a4%b8%e0%a4%82%e0%a4%b5%e0%a4%bf%e0%a4%a7%e0%a4%be%e0%a4%a8/constitution-of-nepal";

request(rootURL)
  .then((html) => {
    let links = [];
    const $ = cheerio.load(html);
    $("article h3>a").each((index, element) => {
      const chapterLinks = $(element).attr("href");
      const output = {
        id: index,
        link: chapterLinks,
      };
      links.push(output);
    });

    fs.writeFile(
      "chapter-links.json",
      JSON.stringify(links, null, 2),
      (error) => {
        if (error) {
          console.error(error);
        }
        console.log("File Saved");
      }
    );
  })
  .catch((error) => {
    console.log(error);
  });

// Need to create 'chapters-download' folder first ----
const rawLinkData = fs.readFileSync("chapter-links.json");
const links = JSON.parse(rawLinkData);
const numnum = num => num <= 9 ? "0"+num : String(num)

links.forEach((URL, index) => {
  request(URL.link)
    .then((html) => {
      let chapters = [];
      const $ = cheerio.load(html, { decodeEntities: false });
      const title = $("h2.entry-title").text();

      if (index !== 0) {
        chapters.push(`\\section{${title}}`);
      }
      $(".entry-content>p").each((_, element) => {
        const chapterHTML = $(element).html().split('\n');
        if (index === 0 && _ === 0) {
          chapters.push("\\section{प्रस्तावना}")
        }
        if (_ >= 4) {
          const chapterText = chapterHTML.join("\n")
            .replace(/<strong>(.+)<\/strong>/g, "\\textbf{$1}")
            .replace(/<br\>↵/g, "\r\n")
            .replace(/<[^>]*>?/gm, '')
          chapters.push(chapterText);
        }
      });

      fs.writeFile(
        `chapters-download/chapter-${numnum(index)}.tex`,
        chapters.join("\r\n\r\n"),
        (error) => {
          if (error) {
            console.error(error);
          }
          console.log(`Chapter ${numnum(index)} saved.`);
        }
      );
    })
    .catch((error) => {
      console.log(error);
    });
});
