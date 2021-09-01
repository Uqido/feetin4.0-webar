const url = new URL(window.location.href);
let lang = url.searchParams.get("lang");

if (!lang)
    lang = "en"

const banana = new Banana(lang);

(async () => {

    const pageName = url.toString().split("/").pop().replace(".html", "")

    const jsonPath = "config/" + pageName + "-config.json";
    const config = await (await fetch(jsonPath)).json()

    window.positions = config.positions
    window.hotspotsId = config.hotspotsId
    window.materialArray = config.materialArray
    window.colors = config.colors
    window.bumps = config.bumps

    window.positionToAnnotation = config.positionToAnnotation

    const localization = config.localizations
    banana.load(localization)
    console.log("Localize to:" + banana.locale)
    document.querySelectorAll('[data-i18n]').forEach((elem) => {
        const key = elem.getAttribute('data-i18n')
        const message = banana.i18n(key)
        if (message !== key)
            elem.innerHTML = message
    })

    var event = new CustomEvent("page-configured");
    document.dispatchEvent(event)
})()