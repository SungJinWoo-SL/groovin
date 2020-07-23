import { Source } from "../Source";
import { Manga, MangaStatus } from "../../models/Manga/Manga";
import { Chapter } from "../../models/Chapter/Chapter";
import { MangaTile } from "../../models/MangaTile/MangaTile";
import { SearchRequest } from "../../models/SearchRequest/SearchRequest";
import { Request } from "../../models/RequestObject/RequestObject";
import { ChapterDetails } from "../../models/ChapterDetails/ChapterDetails";
import { LanguageCode } from "../../models/Languages/Languages";

const RCO_DOMAIN = "https://readcomicsonline.ru";

export class ReadComicsOnline extends Source {
    constructor(cheerio: CheerioAPI) {
        super(cheerio);
    }

    get version(): string {
        return "1.2.0";
    }

    get name(): string {
        return "ReadComicsOnline";
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
        return "Extension that pulls manga from ReadComicsOnline.";
    }

    get hentaiSource(): boolean {
        return false;
    }

    getMangaDetailsRequest(ids: string[]): Request[] {
        let requests: Request[] = [];
        for (let id of ids) {
            requests.push(
                createRequestObject({
                    url: `${RCO_DOMAIN}/comic/${id}`,
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

        let cover = $("div.row div.col-sm-4 div.boxed img")
            .attr("src")
            ?.replace("//", "");
        let title = $("h2.listmanga-header").text().trim();
        let rating = $("div.rating div#item-rating")
            .attr("data-score")!
            .toString()
            .trim();
        let isAdult = false;
        let description = $("div.row div.col-lg-12 div.manga p")
            .text()
            .trim()
            .replace(/\n\n/g, ". ");
        let status = MangaStatus.ONGOING;
        let titles = [];
        titles.push(title!);

        mangas.push(
            createManga({
                id: metadata.id,
                titles: titles,
                image: "https://" + cover!,
                rating: Number(rating),
                status: status,
                author: "UNKNOWN",
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
            url: `${RCO_DOMAIN}/comic/${mangaId}`,
            method: "GET",
            metadata: { mangaId },
        });
    }

    getChapters(data: any, metadata: any): Chapter[] {
        let $ = this.cheerio.load(data);
        let chapters: Chapter[] = [];
        let rawChapters = $("ul.chapters li").toArray();

        for (let element of rawChapters) {
            let title = $("h5.chapter-title-rtl a", element).text().trim();
            let date = new Date(
                Date.parse(
                    $("div.action div.date-chapter-title-rtl", element)
                        .text()
                        .trim()
                )
            );
            let chapterId = $("h5.chapter-title-rtl a", element)
                .attr("href")
                ?.split("/")
                .pop()
                ?.toString()!;
            let chapterNumber =
                parseInt(chapterId) == NaN ? 0 : parseInt(chapterId);
            let volume = parseInt(
                $(element).attr("class")!.match(/(\d+)/)![0].toString()
            );

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
            url: `${RCO_DOMAIN}/comic/${mangaId}/${chapId}`,
            method: "GET",
            metadata: { mangaId, chapId },
        });
    }

    getChapterDetails(data: any, metadata: any): ChapterDetails {
        let $ = this.cheerio.load(data);

        let pageList: string[] = [];

        for (let s of $("script:not([src])").toArray()) {
            let contentRaw = s.children[0].data!.toString().trim();

            if (!contentRaw.startsWith("var title")) continue;

            let pagesRaw = contentRaw
                .replace("var title = document.title;", "")
                .split("var next_chapter")[0];

            let content = `${pagesRaw} new Array(pages)`;

            let contentEval = eval(content);

            for (let page of contentEval[0]) {
                pageList.push(
                    `https://readcomicsonline.ru/uploads/manga/${metadata.mangaId}/chapters/${metadata.chapId}/${page.page_image}`
                );
            }
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
            url: `${RCO_DOMAIN}/search?query=${query.title?.replace(" ", "+")}`,
            method: "GET",
        });
    }

    search(data: any): MangaTile[] | null {
        let suggestions = JSON.parse(data).suggestions;

        let mangas: MangaTile[] = [];

        for (let suggestion of suggestions) {
            mangas.push(
                createMangaTile({
                    id: suggestion.data,
                    image: "https://via.placeholder.com/300x448.png",
                    title: createIconText({ text: suggestion.value ?? "" }),
                })
            );
        }

        return mangas;
    }
}
