import { Source } from "../Source";
import { Manga, MangaStatus } from "../../models/Manga/Manga";
import { Chapter } from "../../models/Chapter/Chapter";
import { MangaTile } from "../../models/MangaTile/MangaTile";
import { SearchRequest } from "../../models/SearchRequest/SearchRequest";
import { Request } from "../../models/RequestObject/RequestObject";
import { ChapterDetails } from "../../models/ChapterDetails/ChapterDetails";
import { LanguageCode } from "../../models/Languages/Languages";

const MK_DOMAIN = "https://mangakisa.com";

export class Mangakisa extends Source {
    constructor(cheerio: CheerioAPI) {
        super(cheerio);
    }

    get version(): string {
        return "1.0.0";
    }

    get name(): string {
        return "Mangakisa";
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
        return "Extension that pulls manga from Mangakisa.";
    }

    get hentaiSource(): boolean {
        return false;
    }

    getMangaDetailsRequest(ids: string[]): Request[] {
        let requests: Request[] = [];
        for (let id of ids) {
            requests.push(
                createRequestObject({
                    url: `${MK_DOMAIN}/${id}`,
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

        let cover = `${MK_DOMAIN}/img/coversjpg/upscaled/${metadata.id}.jpg?13`;
        let title = $("h1.infodes").text().trim();
        let rating = "0";
        let author = $("a.infoan")
            .filter((i, el) => {
                return el.attribs["href"].includes("authors");
            })
            .attr("href")
            ?.split("/")
            .pop();
        let isAdult = false;
        let description = $("div.infodesbox div.infodes2")
            .first()
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
                rating: Number(rating),
                status: status,
                author: author!,
                artist: "UNKNOWN",
                tags: [],
                desc: description!,
                hentai: isAdult,
            })
        );

        return mangas;
    }

    getChaptersRequest(mangaId: string): Request {
        return createRequestObject({
            url: `${MK_DOMAIN}/${mangaId}`,
            method: "GET",
            metadata: { mangaId },
        });
    }

    getChapters(data: any, metadata: any): Chapter[] {
        let $ = this.cheerio.load(data);
        let chapters: Chapter[] = [];
        let rawChapters = $(
            "div.infoepboxmain div.infoepbox a.infovan"
        ).toArray();

        for (let element of rawChapters) {
            let title = $(
                "div.infoepmain div.infoep div.infoept div.infoept1 div.text-main-chapter",
                element
            )
                .text()
                .trim();

            let unixTime = parseInt(
                $(
                    "div.infoepmain div.infoep div.infoept div.infoept3 div time",
                    element
                )
                    .attr("time")
                    ?.toString()!
            );

            let date = new Date(unixTime * 1000);

            let chapterId = $(element).attr("href")!;

            let chapterNumber = parseInt(title.split(" ")[1].toString()) ?? 0;
            let volume = parseInt(title.split(" ")[1].toString()) ?? 0;

            chapters.push(
                createChapter({
                    id: chapterId,
                    mangaId: metadata.mangaId,
                    time: date,
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
            url: `${MK_DOMAIN}/${chapId}`,
            method: "GET",
            metadata: { mangaId, chapId },
        });
    }

    getChapterDetails(data: any, metadata: any): ChapterDetails {
        let $ = this.cheerio.load(data);

        let pages = $("img").toArray();

        let pageList: string[] = [];

        for (let page of pages) {
            let p = $(page).attr("src")!;

            if (p.startsWith("//")) p = p.replace("//", "");

            p = `https://${p}`;

            pageList.push(p);
        }

        let chapterDetails = createChapterDetails({
            id: metadata.chapId,
            mangaId: metadata.mangaId,
            pages: pageList,
            longStrip: true,
        });

        return chapterDetails;
    }

    searchRequest(query: SearchRequest): Request | null {
        return createRequestObject({
            url: `${MK_DOMAIN}/search?q=${query.title?.replace(" ", "+")}`,
            method: "GET",
        });
    }

    search(data: any): MangaTile[] | null {
        let $ = this.cheerio.load(data);

        let mangas: MangaTile[] = [];

        if ($("div.iepbox a.an").toArray().length <= 0) {
            return mangas;
        }

        $("div.iepbox a.an").each((index, manga) => {
            let id = manga.attribs["href"].toString().replace("/", "").trim();
            let title = $(
                "div.similarc div.similard div.centered div.similardd",
                manga
            )
                .text()
                .trim();

            let image =
                MK_DOMAIN +
                $("div.similarc div.similarpic img", manga).attr("src");

            mangas.push(
                createMangaTile({
                    image,
                    id,
                    title: createIconText({ text: title ?? "" }),
                })
            );
        });

        return mangas;
    }
}
