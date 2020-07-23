(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LanguageCode;
(function (LanguageCode) {
    LanguageCode["UNKNOWN"] = "_unknown";
    LanguageCode["BENGALI"] = "bd";
    LanguageCode["BULGARIAN"] = "bg";
    LanguageCode["BRAZILIAN"] = "br";
    LanguageCode["CHINEESE"] = "cn";
    LanguageCode["CZECH"] = "cz";
    LanguageCode["GERMAN"] = "de";
    LanguageCode["DANISH"] = "dk";
    LanguageCode["ENGLISH"] = "gb";
    LanguageCode["SPANISH"] = "es";
    LanguageCode["FINNISH"] = "fi";
    LanguageCode["FRENCH"] = "fr";
    LanguageCode["WELSH"] = "gb";
    LanguageCode["GREEK"] = "gr";
    LanguageCode["CHINEESE_HONGKONG"] = "hk";
    LanguageCode["HUNGARIAN"] = "hu";
    LanguageCode["INDONESIAN"] = "id";
    LanguageCode["ISRELI"] = "il";
    LanguageCode["INDIAN"] = "in";
    LanguageCode["IRAN"] = "ir";
    LanguageCode["ITALIAN"] = "it";
    LanguageCode["JAPANESE"] = "jp";
    LanguageCode["KOREAN"] = "kr";
    LanguageCode["LITHUANIAN"] = "lt";
    LanguageCode["MONGOLIAN"] = "mn";
    LanguageCode["MEXIAN"] = "mx";
    LanguageCode["MALAY"] = "my";
    LanguageCode["DUTCH"] = "nl";
    LanguageCode["NORWEGIAN"] = "no";
    LanguageCode["PHILIPPINE"] = "ph";
    LanguageCode["POLISH"] = "pl";
    LanguageCode["PORTUGUESE"] = "pt";
    LanguageCode["ROMANIAN"] = "ro";
    LanguageCode["RUSSIAN"] = "ru";
    LanguageCode["SANSKRIT"] = "sa";
    LanguageCode["SAMI"] = "si";
    LanguageCode["THAI"] = "th";
    LanguageCode["TURKISH"] = "tr";
    LanguageCode["UKRAINIAN"] = "ua";
    LanguageCode["VIETNAMESE"] = "vn";
})(LanguageCode = exports.LanguageCode || (exports.LanguageCode = {}));

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MangaStatus;
(function (MangaStatus) {
    MangaStatus[MangaStatus["ONGOING"] = 1] = "ONGOING";
    MangaStatus[MangaStatus["COMPLETED"] = 0] = "COMPLETED";
})(MangaStatus = exports.MangaStatus || (exports.MangaStatus = {}));

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Source_1 = require("../Source");
const Manga_1 = require("../../models/Manga/Manga");
const Languages_1 = require("../../models/Languages/Languages");
const RCO_DOMAIN = "https://readcomicsonline.ru";
class ReadComicsOnline extends Source_1.Source {
    constructor(cheerio) {
        super(cheerio);
    }
    get version() {
        return "1.2.0";
    }
    get name() {
        return "ReadComicsOnline";
    }
    get icon() {
        return "icon.png";
    }
    get author() {
        return "Meliodas";
    }
    get authorWebsite() {
        return "https://github.com/SungJinWoo-SL";
    }
    get description() {
        return "Extension that pulls manga from ReadComicsOnline.";
    }
    get hentaiSource() {
        return false;
    }
    getMangaDetailsRequest(ids) {
        let requests = [];
        for (let id of ids) {
            requests.push(createRequestObject({
                url: `${RCO_DOMAIN}/comic/${id}`,
                method: "GET",
                metadata: { id },
            }));
        }
        return requests;
    }
    getMangaDetails(data, metadata) {
        var _a;
        let mangas = [];
        let $ = this.cheerio.load(data);
        let cover = (_a = $("div.row div.col-sm-4 div.boxed img")
            .attr("src")) === null || _a === void 0 ? void 0 : _a.replace("//", "");
        let title = $("h2.listmanga-header").text().trim();
        let rating = $("div.rating div#item-rating")
            .attr("data-score")
            .toString()
            .trim();
        let isAdult = false;
        let description = $("div.row div.col-lg-12 div.manga p")
            .text()
            .trim()
            .replace(/\n\n/g, ". ");
        let status = Manga_1.MangaStatus.ONGOING;
        let titles = [];
        titles.push(title);
        mangas.push(createManga({
            id: metadata.id,
            titles: titles,
            image: "https://" + cover,
            rating: Number(rating),
            status: status,
            author: "UNKNOWN",
            artist: "UNKNOWN",
            tags: [],
            desc: description,
            hentai: isAdult,
        }));
        return mangas;
    }
    getChaptersRequest(mangaId) {
        return createRequestObject({
            url: `${RCO_DOMAIN}/comic/${mangaId}`,
            method: "GET",
            metadata: { mangaId },
        });
    }
    getChapters(data, metadata) {
        var _a, _b;
        let $ = this.cheerio.load(data);
        let chapters = [];
        let rawChapters = $("ul.chapters li").toArray();
        for (let element of rawChapters) {
            let title = $("h5.chapter-title-rtl a", element).text().trim();
            let date = new Date(Date.parse($("div.action div.date-chapter-title-rtl", element)
                .text()
                .trim()));
            let chapterId = (_b = (_a = $("h5.chapter-title-rtl a", element)
                .attr("href")) === null || _a === void 0 ? void 0 : _a.split("/").pop()) === null || _b === void 0 ? void 0 : _b.toString();
            let chapterNumber = parseInt(chapterId) == NaN ? 0 : parseInt(chapterId);
            let volume = parseInt($(element).attr("class").match(/(\d+)/)[0].toString());
            chapters.push(createChapter({
                id: chapterId,
                mangaId: metadata.mangaId,
                time: date,
                name: title,
                langCode: Languages_1.LanguageCode.ENGLISH,
                chapNum: chapterNumber,
                volume: volume,
            }));
        }
        return chapters;
    }
    getChapterDetailsRequest(mangaId, chapId) {
        return createRequestObject({
            url: `${RCO_DOMAIN}/comic/${mangaId}/${chapId}`,
            method: "GET",
            metadata: { mangaId, chapId },
        });
    }
    getChapterDetails(data, metadata) {
        let $ = this.cheerio.load(data);
        let pageList = [];
        for (let s of $("script:not([src])").toArray()) {
            let contentRaw = s.children[0].data.toString().trim();
            if (!contentRaw.startsWith("var title"))
                continue;
            let pagesRaw = contentRaw
                .replace("var title = document.title;", "")
                .split("var next_chapter")[0];
            let content = `${pagesRaw} new Array(pages)`;
            let contentEval = eval(content);
            for (let page of contentEval[0]) {
                pageList.push(`https://readcomicsonline.ru/uploads/manga/${metadata.mangaId}/chapters/${metadata.chapId}/${page.page_image}`);
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
    searchRequest(query, page) {
        var _a;
        return createRequestObject({
            url: `${RCO_DOMAIN}/search?query=${(_a = query.title) === null || _a === void 0 ? void 0 : _a.replace(" ", "+")}`,
            method: "GET",
        });
    }
    search(data) {
        var _a;
        let suggestions = JSON.parse(data).suggestions;
        let mangas = [];
        for (let suggestion of suggestions) {
            mangas.push(createMangaTile({
                id: suggestion.data,
                image: "https://via.placeholder.com/300x448.png",
                title: createIconText({ text: (_a = suggestion.value) !== null && _a !== void 0 ? _a : "" }),
            }));
        }
        return mangas;
    }
}
exports.ReadComicsOnline = ReadComicsOnline;

},{"../../models/Languages/Languages":1,"../../models/Manga/Manga":2,"../Source":4}],4:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Source {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
    /**
     * An optional field where the author may put a link to their website
     */
    get authorWebsite() {
        return null;
    }
    /**
     * An optional field that defines the language of the extension's source
     */
    get language() {
        return "all";
    }
    // <-----------        OPTIONAL METHODS        -----------> //
    /**
     * Returns the number of calls that can be done per second from the application
     * This is to avoid IP bans from many of the sources
     * Can be adjusted per source since different sites have different limits
     */
    get rateLimit() {
        return 2;
    }
    requestModifier(request) {
        return request;
    }
    getMangaShareUrl(mangaId) {
        return null;
    }
    /**
     * (OPTIONAL METHOD) Different sources have different tags available for searching. This method
     * should target a URL which allows you to parse apart all of the available tags which a website has.
     * This will populate tags in the iOS application where the user can use
     * @returns A request object which can provide HTML for determining tags that a source uses
     */
    getTagsRequest() {
        return null;
    }
    /**
     * (OPTIONAL METHOD) A function which should handle parsing apart HTML returned from {@link Source.getTags}
     * and generate a list of {@link TagSection} objects, determining what sections of tags an app has, as well as
     * what tags are associated with each section
     * @param data HTML which can be parsed to get tag information
     */
    getTags(data) {
        return null;
    }
    /**
     * (OPTIONAL METHOD) A function which should handle generating a request for determining whether or
     * not a manga has been updated since a specific reference time.
     * This method is different depending on the source. A current implementation for a source, as example,
     * is going through multiple pages of the 'latest' section, and determining whether or not there
     * are entries available before your supplied date.
     * @param ids The manga IDs which you are searching for updates on
     * @param time A {@link Date} marking the point in time you'd like to search up from.
     * Eg, A date of November 2020, when it is currently December 2020, should return all instances
     * of the image you are searching for, which has been updated in the last month
     * @param page A page number parameter may be used if your update scanning requires you to
     * traverse multiple pages.
     */
    filterUpdatedMangaRequest(ids, time, page) {
        return null;
    }
    /**
     * (OPTIONAL METHOD) A function which should handle parsing apart HTML returned from {@link Source.filterUpdatedMangaRequest}
     * and generate a list manga which has been updated within the timeframe specified in the request.
     * @param data HTML which can be parsed to determine whether or not a Manga has been updated or not
     * @param metadata Anything passed to the {@link Request} object in {@link Source.filterUpdatedMangaRequest}
     * with the key of metadata will be available to this method here in this parameter
     * @returns A list of mangaID which has been updated. Also, a nextPage parameter is required. This is a flag
     * which should be set to true, if you need to traverse to the next page of your search, in order to fully
     * determine whether or not you've gotten all of the updated manga or not. This will increment
     * the page number in the {@link Source.filterUpdatedMangaRequest} method and run it again with the new
     * parameter
     */
    filterUpdatedManga(data, metadata) {
        return null;
    }
    /**
     * (OPTIONAL METHOD) A function which should generate a {@link HomeSectionRequest} with the intention
     * of parsing apart a home page of a source, and grouping content into multiple categories.
     * This does not exist for all sources, but sections you would commonly see would be
     * 'Latest Manga', 'Hot Manga', 'Recommended Manga', etc.
     * @returns A list of {@link HomeSectionRequest} objects. A request for search section on the home page.
     * It is likely that your request object will be the same in all of them.
     */
    getHomePageSectionRequest() {
        return null;
    }
    /**
     * (OPTIONAL METHOD) A function which should handle parsing apart HTML returned from {@link Source.getHomePageSectionRequest}
     * and finish filling out the {@link HomeSection} objects.
     * Generally this simply should update the parameter obejcts with all of the correct contents, and
     * return the completed array
     * @param data The HTML which should be parsed into the {@link HomeSection} objects. There may only be one element in the array, that is okay
     * if only one section exists
     * @param section The list of HomeSection objects which are unfinished, and need filled out
     */
    getHomePageSections(data, section) {
        return null;
    }
    /**
     * (OPTIONAL METHOD) For many of the home page sections, there is an ability to view more of that selection
     * Calling this function should generate a {@link Request} targeting a new page of a given key
     * @param key The current page that is being viewed
     * @param page The page number which you are currently searching
     */
    getViewMoreRequest(key, page) {
        return null;
    }
    /**
     * (OPTIONAL METHOD) A function which should handle parsing apart a page
     * and generate different {@link MangaTile} objects which can be found on it
     * @param data HTML which should be parsed into a {@link MangaTile} object
     * @param key
     */
    getViewMoreItems(data, key) {
        return null;
    }
    // <-----------        PROTECTED METHODS        -----------> //
    // Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
    convertTime(timeAgo) {
        var _a;
        let time;
        let trimmed = Number(((_a = /\d*/.exec(timeAgo)) !== null && _a !== void 0 ? _a : [])[0]);
        trimmed = trimmed == 0 && timeAgo.includes("a") ? 1 : trimmed;
        if (timeAgo.includes("minutes")) {
            time = new Date(Date.now() - trimmed * 60000);
        }
        else if (timeAgo.includes("hours")) {
            time = new Date(Date.now() - trimmed * 3600000);
        }
        else if (timeAgo.includes("days")) {
            time = new Date(Date.now() - trimmed * 86400000);
        }
        else if (timeAgo.includes("year") || timeAgo.includes("years")) {
            time = new Date(Date.now() - trimmed * 31556952000);
        }
        else {
            time = new Date(Date.now());
        }
        return time;
    }
}
exports.Source = Source;

},{}]},{},[3])(3)
});
