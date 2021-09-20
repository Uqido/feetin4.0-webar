const url = new URL(window.location.href);
let lang = url.searchParams.get("lang");

if (!lang)
    lang = "en"

const banana = new Banana(lang);


document.addEventListener("page-configured", function(e) {
    window.forceNoIframe = true;
    window.forceAnnotations = true;

    const annotations = window.hotspotsId.map((elem) => document.getElementById(elem));
    window.annotations = annotations

    for (let annotation of annotations) {
        annotation.classList.add("hide-child");
    }


    const hideAndDisablePin = function() {
        if (annotations === undefined)
            return
        for (let annotation of annotations) {
            annotation.classList.add("hide-child");
            annotation.classList.remove("hide-pulse");
        }

        for (let annotation of annotations) {
            annotation.style.display = "none"
        }
    }

    const showAndEnablePin = function() {
        if (annotations === undefined)
            return

        for (let annotation of annotations) {
            annotation.style.display = "block"
        }
    }

    let is_Open = false;

    window.model_Animate = function() {
        console.log("animate")
        console.log(modelViewer.paused)
        if (modelViewer.paused) {
            if (is_Open) {
                modelViewer.animationName = "Idle";
                modelViewer.animationName = "Animation";
                hideAndDisablePin()
                is_Open = false;
                const interval = setInterval(() => {
                    if (modelViewer.paused) {
                        clearInterval(interval);
                        showAndEnablePin();
                    }
                }, 500);
            } else {
                modelViewer.animationName = "Idle";
                modelViewer.animationName = "Animation";
                hideAndDisablePin()
                is_Open = true;
                const interval = setInterval(() => {
                    if (modelViewer.paused) {
                        clearInterval(interval);
                        showAndEnablePin();
                    }
                }, 500);
            }
            modelViewer.play();
        }
    }


    window.onPinClick = function(annotationID) {

        const item = document.getElementById(annotationID);

        if (!item.classList.contains("hide-child")) {
            //it was already opened! closing
            for (let annotation of annotations) {
                annotation.classList.add("hide-child");
                annotation.classList.remove("hide-pulse");
            }
            return;
        }

        for (let annotation of annotations) {
            annotation.classList.add("hide-child");
            annotation.classList.remove("hide-pulse");
        }

        item.classList.remove("hide-child")
        item.classList.add("hide-pulse")
    }

});




(async() => {

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