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
const MF_DOMAIN = 'https://fanfox.net';
const MF_DOMAIN_MOBILE = 'https://m.fanfox.net';
class MangaFox extends Source_1.Source {
    constructor(cheerio) {
        super(cheerio);
    }
    get version() { return '1.1.2'; }
    get name() { return 'MangaFox'; }
    get icon() { return 'icon.png'; }
    get author() { return 'Sirus'; }
    get authorWebsite() { return 'https://github.com/Sirush'; }
    get description() { return 'Extension that pulls manga from MangaFox, includes Advanced Search and Updated manga fetching'; }
    get hentaiSource() {
        return false;
    }
    getMangaDetailsRequest(ids) {
        let requests = [];
        for (let id of ids) {
            let metadata = { 'id': id };
            requests.push(createRequestObject({
                url: `${MF_DOMAIN}/manga/${id}`,
                method: 'GET',
                cookies: [createCookie({ name: 'isAdult', value: '1', domain: MF_DOMAIN })],
                metadata: metadata
            }));
        }
        return requests;
    }
    getMangaDetails(data, metadata) {
        let mangas = [];
        let tagRegexp = new RegExp('\\/directory\\/(.*)\\/');
        let $ = this.cheerio.load(data);
        let tagSections = [createTagSection({ id: '0', label: 'genres', tags: [] }),
            createTagSection({ id: '1', label: 'format', tags: [] })];
        let details = $('.detail-info-right');
        let cover = $('img.detail-bg-img').first().attr('src');
        let title = $('span.detail-info-right-title-font', details).text().trim();
        let rawStatus = $('span.detail-info-right-title-tip', details).text().trim();
        let rating = $('span.item-score', details).text().trim().replace(',', '.');
        let author = $('p.detail-info-right-say a', details).text().trim();
        let isAdult = false;
        let tags = $('a', '.detail-info-right-tag-list').each((i, tag) => {
            var _a;
            let id = ((_a = $(tag).attr('href')) === null || _a === void 0 ? void 0 : _a.match(tagRegexp))[1];
            let label = $(tag).text().trim();
            if ((label === null || label === void 0 ? void 0 : label.includes('Adult')) || (label === null || label === void 0 ? void 0 : label.includes('Mature')))
                isAdult = true;
            tagSections[0].tags.push(createTag({ id: id, label: label }));
        });
        for (let tag in tags) {
        }
        let description = $('p.fullcontent').text().trim();
        let status = Manga_1.MangaStatus.ONGOING;
        switch (rawStatus) {
            case 'Ongoing':
                status = Manga_1.MangaStatus.ONGOING;
                break;
            case 'Completed':
                status = Manga_1.MangaStatus.COMPLETED;
                break;
            default:
                status = Manga_1.MangaStatus.ONGOING;
                break;
        }
        let titles = [];
        titles.push(title);
        mangas.push(createManga({
            id: metadata.id,
            titles: titles,
            image: cover,
            rating: Number(rating),
            status: status,
            author: author,
            tags: tagSections,
            desc: description,
            hentai: isAdult
        }));
        return mangas;
    }
    getChaptersRequest(mangaId) {
        let metadata = { mangaId };
        return createRequestObject({
            url: `${MF_DOMAIN}/manga/${mangaId}`,
            method: "GET",
            metadata: metadata,
            cookies: [createCookie({ name: 'isAdult', value: '1', domain: MF_DOMAIN })]
        });
    }
    getChapters(data, metadata) {
        var _a, _b;
        let $ = this.cheerio.load(data);
        let chapters = [];
        let rawChapters = $('div#chapterlist ul li').children('a').toArray().reverse();
        let chapterIdRegex = new RegExp('\\/manga\\/[a-zA-Z0-9_]*\\/(.*)\\/');
        let chapterNumberRegex = new RegExp('c([0-9.]+)');
        let volumeRegex = new RegExp('Vol.(\\d+)');
        for (let element of rawChapters) {
            let title = (_a = $('p.title3', element).html()) !== null && _a !== void 0 ? _a : '';
            let date = new Date(Date.parse((_b = $('p.title2', element).html()) !== null && _b !== void 0 ? _b : ''));
            let chapterId = element.attribs['href'].match(chapterIdRegex)[1];
            let chapterNumber = Number("0" + chapterId.match(chapterNumberRegex)[1]);
            let volMatch = title.match(volumeRegex);
            let volume = volMatch != null && volMatch.length > 0 ? Number(volMatch[1]) : undefined;
            chapters.push(createChapter({
                id: chapterId,
                mangaId: metadata.mangaId,
                time: date,
                name: title,
                langCode: Languages_1.LanguageCode.ENGLISH,
                chapNum: chapterNumber,
                volume: volume
            }));
        }
        return chapters;
    }
    getChapterDetailsRequest(mangaId, chapId) {
        let metadata = { 'mangaId': mangaId, 'chapterId': chapId, 'nextPage': false, 'page': 1 };
        return createRequestObject({
            url: `${MF_DOMAIN_MOBILE}/roll_manga/${mangaId}/${chapId}`,
            method: "GET",
            metadata: metadata,
            cookies: [createCookie({ name: 'isAdult', value: '1', domain: MF_DOMAIN })]
        });
    }
    getChapterDetails(data, metadata) {
        let $ = this.cheerio.load(data);
        let pages = [];
        var rawPages = $('div#viewer').children('img').toArray();
        for (let page of rawPages) {
            pages.push(page.attribs['data-original']);
        }
        let chapterDetails = createChapterDetails({
            id: metadata.chapterId,
            mangaId: metadata.mangaId,
            pages: pages,
            longStrip: false
        });
        return chapterDetails;
    }
    getHomePageSectionRequest() {
        let request = createRequestObject({ url: `${MF_DOMAIN}`, method: 'GET' });
        let section1 = createHomeSection({ id: 'hot_manga', title: 'Hot Manga Releases' });
        let section2 = createHomeSection({ id: 'being_read', title: 'Being Read Right Now' });
        let section3 = createHomeSection({ id: 'new_manga', title: 'New Manga Release' });
        let section4 = createHomeSection({ id: 'latest_updates', title: 'Latest Updates' });
        return [createHomeSectionRequest({ request: request, sections: [section1, section2, section3, section4] })];
    }
    getHomePageSections(data, sections) {
        var _a, _b, _c, _d;
        let $ = this.cheerio.load(data);
        let hotManga = [];
        let beingReadManga = [];
        let newManga = [];
        let latestManga = [];
        let idRegExp = new RegExp('\\/manga\\/(.*)\\/');
        let firstSection = $('div.main-large').first();
        let hotMangas = $('.manga-list-1', firstSection).first();
        let beingReadMangas = hotMangas.next();
        let newMangas = $('div.line-list');
        let latestMangas = $('ul.manga-list-4-list');
        for (let manga of $('li', hotMangas).toArray()) {
            let id = ((_a = $('a', manga).first().attr('href')) === null || _a === void 0 ? void 0 : _a.match(idRegExp))[1];
            let cover = $('img', manga).first().attr('src');
            let title = $('.manga-list-1-item-title', manga).text().trim();
            let subtitle = $('.manga-list-1-item-subtitle', manga).text().trim();
            hotManga.push(createMangaTile({
                id: id,
                image: cover,
                title: createIconText({ text: title }),
                subtitleText: createIconText({ text: subtitle }),
            }));
        }
        for (let manga of $('li', beingReadMangas).toArray()) {
            let id = ((_b = $('a', manga).first().attr('href')) === null || _b === void 0 ? void 0 : _b.match(idRegExp))[1];
            let cover = $('img', manga).first().attr('src');
            let title = $('.manga-list-1-item-title', manga).text().trim();
            let subtitle = $('.manga-list-1-item-subtitle', manga).text().trim();
            beingReadManga.push(createMangaTile({
                id: id,
                image: cover,
                title: createIconText({ text: title }),
                subtitleText: createIconText({ text: subtitle }),
            }));
        }
        for (let manga of $('li', newMangas).toArray()) {
            let id = ((_c = $('a', manga).first().attr('href')) === null || _c === void 0 ? void 0 : _c.match(idRegExp))[1];
            let cover = $('img', manga).first().attr('src');
            let title = $('.manga-list-1-item-title', manga).text().trim();
            let subtitle = $('.manga-list-1-item-subtitle', manga).text().trim();
            newManga.push(createMangaTile({
                id: id,
                image: cover,
                title: createIconText({ text: title }),
                subtitleText: createIconText({ text: subtitle }),
            }));
        }
        for (let manga of $('.manga-list-4-list > li', latestMangas).toArray()) {
            let id = ((_d = $('a', manga).first().attr('href')) === null || _d === void 0 ? void 0 : _d.match(idRegExp))[1];
            let cover = $('img', manga).first().attr('src');
            let title = $('.manga-list-4-item-title', manga).text().trim();
            let subtitle = $('.manga-list-4-item-subtitle', manga).text().trim();
            latestManga.push(createMangaTile({
                id: id,
                image: cover,
                title: createIconText({ text: title }),
                subtitleText: createIconText({ text: subtitle }),
            }));
        }
        // console.log(updateManga)
        sections[0].items = hotManga;
        sections[1].items = beingReadManga;
        sections[2].items = newManga;
        sections[3].items = latestManga;
        return sections;
    }
    searchRequest(query, page) {
        var _a, _b, _c, _d;
        let genres = ((_a = query.includeGenre) !== null && _a !== void 0 ? _a : []).join(',');
        let excluded = ((_b = query.excludeGenre) !== null && _b !== void 0 ? _b : []).join(',,');
        let type = ((_c = query.includeFormat) !== null && _c !== void 0 ? _c : [])[0];
        let status = "";
        switch (query.status) {
            case 0:
                status = '2';
                break;
            case 1:
                status = '1';
                break;
            default:
                status = '0';
        }
        let search = `name=${encodeURI((_d = query.title) !== null && _d !== void 0 ? _d : '')}&`;
        search += `author=${encodeURI(query.author || '')}&`;
        search += `artist=${encodeURI(query.artist || '')}&`;
        search += `type=${type}&genres=${genres}&nogenres=${excluded}&st=${status}`;
        let metadata = { 'search': search };
        return createRequestObject({
            url: `${MF_DOMAIN}/search?${search}`,
            method: 'GET',
            metadata: metadata,
            cookies: [createCookie({ name: 'isAdult', value: '1', domain: MF_DOMAIN })]
        });
    }
    search(data, metadata) {
        let $ = this.cheerio.load(data);
        let mangas = [];
        let idRegExp = new RegExp('\\/manga\\/(.*)\\/');
        $('ul.manga-list-4-list').children('li').each((index, manga) => {
            var _a;
            let id = ((_a = $('a', manga).first().attr('href')) === null || _a === void 0 ? void 0 : _a.match(idRegExp))[1];
            let cover = $('img', manga).first().attr('src');
            let title = $('p.manga-list-4-item-title a', manga).first().text().trim();
            let tips = $('p.manga-list-4-item-tip', manga).toArray();
            let author = $('a', tips[0]).text().trim();
            let lastUpdate = $('a', tips[1]).text().trim();
            let shortDesc = $(tips[2]).text().trim();
            mangas.push(createMangaTile({
                id: id,
                image: cover,
                title: createIconText({ text: title !== null && title !== void 0 ? title : '' }),
                subtitleText: createIconText({ text: author !== null && author !== void 0 ? author : '' }),
                primaryText: createIconText({ text: shortDesc !== null && shortDesc !== void 0 ? shortDesc : '' }),
                secondaryText: createIconText({ text: lastUpdate !== null && lastUpdate !== void 0 ? lastUpdate : '' }),
            }));
        });
        return mangas;
    }
    getMangaShareUrl(mangaId) {
        return `${MF_DOMAIN}/manga/${mangaId}`;
    }
    filterUpdatedMangaRequest(ids, time, page) {
        let metadata = { ids: ids, targetDate: time };
        return createRequestObject({
            url: `${MF_DOMAIN}/releases/${page}.html`,
            method: 'GET',
            metadata: metadata,
            cookies: [createCookie({ name: 'isAdult', value: '1', domain: MF_DOMAIN })]
        });
    }
    filterUpdatedManga(data, metadata) {
        let $ = this.cheerio.load(data);
        let nextPage = true;
        let updatedManga = [];
        for (let obj of $('li', $('.manga-list-4-list')).toArray()) {
            // If the time for this object is later than our target date, do not navigate to the next page
            let dateContext = $('.manga-list-4-item-subtitle', $(obj));
            let date = $('span', dateContext).text();
            let dateObj;
            if (date.includes("Today")) {
                dateObj = new Date(); // Create a comparison date for the current day
            }
            else if (date.includes("Yesterday")) {
                dateObj = new Date(); // Create a comparison date for yesterday
                dateObj.setDate(dateObj.getDate() - 1);
            }
            else {
                dateObj = new Date(date);
            }
            // Was this a good date parse? If the date is not valid, continue to the next object.
            if (dateObj.toString().includes("Invalid")) {
                continue;
            }
            if (metadata.targetDate < dateObj) {
                // We've gone past our target date, we're safe to stop here
                nextPage = false;
                break;
            }
            else {
                // This is a valid date, check if this is a title which we are looking for
                let mangaIdContext = $('.manga-list-4-item-title', $(obj));
                let mangaId = $('a', mangaIdContext).attr('href').replace('/manga/', '').replace('/', '');
                if (metadata.ids.includes(mangaId)) { // If we have a matching ID, add it to our return list!
                    updatedManga.push(mangaId);
                }
            }
        }
        return { updatedMangaIds: updatedManga, nextPage: nextPage };
    }
}
exports.MangaFox = MangaFox;

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
    get authorWebsite() { return null; }
    /**
     * An optional field that defines the language of the extension's source
     */
    get language() { return 'all'; }
    // <-----------        OPTIONAL METHODS        -----------> //
    /**
     * Returns the number of calls that can be done per second from the application
     * This is to avoid IP bans from many of the sources
     * Can be adjusted per source since different sites have different limits
     */
    get rateLimit() { return 2; }
    requestModifier(request) { return request; }
    getMangaShareUrl(mangaId) { return null; }
    /**
     * (OPTIONAL METHOD) Different sources have different tags available for searching. This method
     * should target a URL which allows you to parse apart all of the available tags which a website has.
     * This will populate tags in the iOS application where the user can use
     * @returns A request object which can provide HTML for determining tags that a source uses
     */
    getTagsRequest() { return null; }
    /**
     * (OPTIONAL METHOD) A function which should handle parsing apart HTML returned from {@link Source.getTags}
     * and generate a list of {@link TagSection} objects, determining what sections of tags an app has, as well as
     * what tags are associated with each section
     * @param data HTML which can be parsed to get tag information
     */
    getTags(data) { return null; }
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
    filterUpdatedMangaRequest(ids, time, page) { return null; }
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
    filterUpdatedManga(data, metadata) { return null; }
    /**
     * (OPTIONAL METHOD) A function which should generate a {@link HomeSectionRequest} with the intention
     * of parsing apart a home page of a source, and grouping content into multiple categories.
     * This does not exist for all sources, but sections you would commonly see would be
     * 'Latest Manga', 'Hot Manga', 'Recommended Manga', etc.
     * @returns A list of {@link HomeSectionRequest} objects. A request for search section on the home page.
     * It is likely that your request object will be the same in all of them.
     */
    getHomePageSectionRequest() { return null; }
    /**
     * (OPTIONAL METHOD) A function which should handle parsing apart HTML returned from {@link Source.getHomePageSectionRequest}
     * and finish filling out the {@link HomeSection} objects.
     * Generally this simply should update the parameter obejcts with all of the correct contents, and
     * return the completed array
     * @param data The HTML which should be parsed into the {@link HomeSection} objects. There may only be one element in the array, that is okay
     * if only one section exists
     * @param section The list of HomeSection objects which are unfinished, and need filled out
     */
    getHomePageSections(data, section) { return null; }
    /**
     * (OPTIONAL METHOD) For many of the home page sections, there is an ability to view more of that selection
     * Calling this function should generate a {@link Request} targeting a new page of a given key
     * @param key The current page that is being viewed
     * @param page The page number which you are currently searching
     */
    getViewMoreRequest(key, page) { return null; }
    /**
     * (OPTIONAL METHOD) A function which should handle parsing apart a page
     * and generate different {@link MangaTile} objects which can be found on it
     * @param data HTML which should be parsed into a {@link MangaTile} object
     * @param key
     */
    getViewMoreItems(data, key) { return null; }
    // <-----------        PROTECTED METHODS        -----------> //
    // Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
    convertTime(timeAgo) {
        var _a;
        let time;
        let trimmed = Number(((_a = /\d*/.exec(timeAgo)) !== null && _a !== void 0 ? _a : [])[0]);
        trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
        if (timeAgo.includes('minutes')) {
            time = new Date(Date.now() - trimmed * 60000);
        }
        else if (timeAgo.includes('hours')) {
            time = new Date(Date.now() - trimmed * 3600000);
        }
        else if (timeAgo.includes('days')) {
            time = new Date(Date.now() - trimmed * 86400000);
        }
        else if (timeAgo.includes('year') || timeAgo.includes('years')) {
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
