import { Source } from "../Source";
import { Manga, MangaStatus } from "../../models/Manga/Manga";
import { Chapter } from "../../models/Chapter/Chapter";
import { MangaTile } from "../../models/MangaTile/MangaTile";
import { SearchRequest } from "../../models/SearchRequest/SearchRequest";
import { Request } from "../../models/RequestObject/RequestObject";
import { ChapterDetails } from "../../models/ChapterDetails/ChapterDetails";
import { LanguageCode } from "../../models/Languages/Languages";
import moment, { unitOfTime } from "moment";

const LV_DOMAIN = "https://leviatanscans.com";

export class LeviatanScans extends Source {
  constructor(cheerio: CheerioAPI) {
    super(cheerio);
  }

  get version(): string {
    return "1.1.0";
  }

  get name(): string {
    return "Leviatan Scans";
  }

  get icon(): string {
    return "icon.png";
  }

  get author(): string {
    return "Meliodas";
  }

  get authorWebsite(): string {
    return "https://github.com/SungJinWoo-SL";
  }

  get description(): string {
    return "Extension that pulls manga from LeviatanScans.";
  }

  get hentaiSource(): boolean {
    return false;
  }

  getMangaDetailsRequest(ids: string[]): Request[] {
    let requests: Request[] = [];
    for (let id of ids) {
      requests.push(
        createRequestObject({
          url: `${LV_DOMAIN}/comics/${id}`,
          method: "GET",
          metadata: { id },
        })
      );
    }
    return requests;
  }

  getMangaDetails(data: any, metadata: any): Manga[] {
    let mangas: Manga[] = [];

    let $ = this.cheerio.load(data);

    let cover =
      LV_DOMAIN +
      $("a.media-content")
        .attr("style")
        ?.match(/\(([^)]+)\)/)![1]
        .toString();
    let title = $("h5.text-highlight").first().text().trim();

    let isAdultItem = $("div.item-feed")
      .filter((i, el) => {
        return $(el).text().trim() === "Mature (18+)";
      })
      .parents()[1];

    let isAdultText = $("div.no-wrap", isAdultItem)
      .children()
      .first()
      .text()
      .trim();

    let isAdult = isAdultText === "Yes" ? true : false;

    let description = $("div.col-lg-9")
      .clone()
      .children()
      .remove()
      .end()
      .text()
      .trim();
    let status = MangaStatus.ONGOING;
    let titles = [];
    titles.push(title!);

    mangas.push(
      createManga({
        id: metadata.id,
        titles: titles,
        image: cover!,
        rating: Number("0"),
        status: status,
        author: "Unknown",
        artist: "Unknown",
        tags: [],
        desc: description!,
        hentai: isAdult,
      })
    );

    return mangas;
  }

  getChaptersRequest(mangaId: string): Request {
    return createRequestObject({
      url: `${LV_DOMAIN}/comics/${mangaId}/`,
      method: "GET",
      metadata: { mangaId },
    });
  }

  getChapters(data: any, metadata: any): Chapter[] {
    let $ = this.cheerio.load(data);
    let chapters: Chapter[] = [];
    let rawChapters = $("div.list-item.col-sm-3").toArray();

    for (let element of rawChapters) {
      let title = $("div.flex", element).children().first().text().trim();

      let chapterNumbers = $("div.flex a.item-author", element)
        .attr("href")
        ?.replace(`${LV_DOMAIN}/comics/${metadata.mangaId}/`, "")
        .split("/");

      let chapterId = chapterNumbers![1];
      let chapterNumber = parseInt(chapterNumbers![1]);
      let volume = parseInt(chapterNumbers![0]);
      let rawDate = $("a.item-company", element).text().trim();

      const parseRelativeDate = (str: string): Date => {
        let trimmedDate: string[] = str
          .substr(0, str.indexOf(" ago"))
          .split(" ");

        // @ts-ignore: moment is being stupid
        return moment().subtract(trimmedDate[0], trimmedDate[1]).toDate();
      };

      let releaseDate = parseRelativeDate(rawDate);

      chapters.push(
        createChapter({
          id: chapterId,
          mangaId: metadata.mangaId,
          time: releaseDate,
          name: title,
          langCode: LanguageCode.ENGLISH,
          chapNum: chapterNumber,
          volume: volume,
        })
      );
    }

    return chapters;
  }

  getChapterDetailsRequest(mangaId: string, chapId: string): Request {
    return createRequestObject({
      url: `${LV_DOMAIN}/comics/${mangaId}/1/${chapId}`,
      method: "GET",
      metadata: { mangaId, chapId },
    });
  }

  getChapterDetails(data: any, metadata: any): ChapterDetails {
    let $ = this.cheerio.load(data);

    let script = $("script").get();

    let pages: string[] = [];

    let toBeEvaledRaw = ``;

    for (let i of script) {
      if (i["children"][0] !== undefined) {
        if (i["children"][0]["data"].includes("window.chapterPages")) {
          toBeEvaledRaw = i["children"][0]["data"].split(
            `window.slug = "${metadata.mangaId}";`
          )[1];
        }
      }
    }

    let toBeEvaled = toBeEvaledRaw
      .split("window.nextChapter")[0]
      .replace("window.chapterPages", "let chapPages");

    toBeEvaled += "new Array(chapPages)";

    let evaled = eval(toBeEvaled)[0];

    for (let part of evaled) {
      pages.push("https://leviatanscans.com" + part);
    }

    let chapterDetails = createChapterDetails({
      id: metadata.chapId,
      mangaId: metadata.mangaId,
      pages: pages,
      longStrip: false,
    });

    return chapterDetails;
  }

  searchRequest(query: SearchRequest, page: number): Request | null {
    return createRequestObject({
      url: `${LV_DOMAIN}/comics?query=${escape(
        query.title?.replace(" ", "+")!
      )}`,
      method: "GET",
    });
  }

  search(data: any): MangaTile[] | null {
    let $ = this.cheerio.load(data);

    let mangas: MangaTile[] = [];

    $("div.list-item").each((index, manga) => {
      let chapterIdRaw = $("div.list-content div.list-body a", manga)
        .attr("href")
        ?.split("/");

      let chapterIdClean = chapterIdRaw?.filter((i) => {
        return i != "" && i != null;
      });

      let chapterId = "";

      if (chapterIdClean && chapterIdClean.length > 1) {
        chapterId = chapterIdClean.pop()!.toString();
      }

      let title = $("div.list-content div.list-body a", manga).text().trim();

      let tag = $("div.media a", manga)
        .attr("style")
        ?.match(/\((.*?)\)/);

      let image = LV_DOMAIN + tag![1];

      mangas.push(
        createMangaTile({
          id: chapterId,
          image: image,
          title: createIconText({ text: title ?? "" }),
        })
      );
    });

    return mangas;
  }
}
