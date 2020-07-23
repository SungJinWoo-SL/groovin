import { Source } from "../Source";
import { Manga, MangaStatus } from "../../models/Manga/Manga";
import { Chapter } from "../../models/Chapter/Chapter";
import { MangaTile } from "../../models/MangaTile/MangaTile";
import { SearchRequest } from "../../models/SearchRequest/SearchRequest";
import { Request } from "../../models/RequestObject/RequestObject";
import { ChapterDetails } from "../../models/ChapterDetails/ChapterDetails";
import { LanguageCode } from "../../models/Languages/Languages";

const LV_DOMAIN = "https://leviatanscans.com";

export class LevithanScans extends Source {
    constructor(cheerio: CheerioAPI) {
        super(cheerio);
    }

    get version(): string {
        return "0.0.1";
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
        return "Extension that pulls manga from LevithanScans.";
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

            chapters.push(
                createChapter({
                    id: chapterId,
                    mangaId: metadata.mangaId,
                    time: undefined,
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
        /*
            let script = $('script').get();

let toBeEvaledRaw = ``;

for (let i of script) {
  if (i['children'][0] !== undefined) {
    if (i['children'][0]['data'].includes('window.chapterPages')) {
      toBeEvaledRaw = i['children'][0]['data'].split('window.slug="656006-auto-hunting";')[1]
    }
  }
}

let toBeEvaled = toBeEvaledRaw.split('window.nextChapter=null;')[0].replace('window.chapterPages', 'let chapPages');

toBeEvaled += "new Array(chapPages)";

let evaled = eval(toBeEvaled)[0]

for (let part of evaled) {
  console.log("https://leviatanscans.com" + part)
}
        */

        let pages = JSON.parse(data)["pages"];

        console.log(pages);

        let pageList: string[] = [];

        for (let page of pages) {
            pageList.push(page.url);
        }

        let chapterDetails = createChapterDetails({
            id: metadata.chapId,
            mangaId: metadata.mangaId,
            pages: pageList,
            longStrip: false,
        });

        return chapterDetails;
    }

    searchRequest(query: SearchRequest, page: number): Request | null {
        return createRequestObject({
            url: `${LV_DOMAIN}/reader/search`,
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
            },
            data: {
                search: query.title?.replace(" ", "%20"),
            },
        });
    }

    search(data: any): MangaTile[] | null {
        let $ = this.cheerio.load(data);

        let mangas: MangaTile[] = [];

        if ($("div.group").toArray().length <= 0) {
            return mangas;
        }

        $("div.group").each((index, manga) => {
            let chapterIdRaw = $("div.title a", manga).attr("href")?.split("/");
            let chapterIdClean = chapterIdRaw?.filter((i) => {
                return i != "" && i != null;
            });
            let chapterId = "";
            if (chapterIdClean && chapterIdClean.length > 1) {
                chapterId = chapterIdClean.pop()!.toString();
            }
            let title = $("div.title a", manga).attr("title");
            /* let lastUpdate = new Date(
        Date.parse($("div.meta_r", manga).html() ?? "")
      ).toLocaleDateString(); */

            mangas.push(
                createMangaTile({
                    id: chapterId,
                    image: "https://via.placeholder.com/300x448.png",
                    title: createIconText({ text: title ?? "" }),
                })
            );
        });

        return mangas;
    }
}
