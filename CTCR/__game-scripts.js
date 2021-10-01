var OrbitCamera = pc.createScript("orbitCamera");
OrbitCamera.attributes.add("distanceMax", { type: "number", default: 0, title: "Distance Max", description: "Setting this at 0 will give an infinite distance limit" }), OrbitCamera.attributes.add("distanceMin", { type: "number", default: 0, title: "Distance Min" }), OrbitCamera.attributes.add("pitchAngleMax", { type: "number", default: 90, title: "Pitch Angle Max (degrees)" }), OrbitCamera.attributes.add("pitchAngleMin", { type: "number", default: -90, title: "Pitch Angle Min (degrees)" }), OrbitCamera.attributes.add("inertiaFactor", { type: "number", default: 0, title: "Inertia Factor", description: "Higher value means that the camera will continue moving after the user has stopped dragging. 0 is fully responsive." }), OrbitCamera.attributes.add("focusEntity", { type: "entity", title: "Focus Entity", description: "Entity for the camera to focus on. If blank, then the camera will use the whole scene" }), OrbitCamera.attributes.add("frameOnStart", { type: "boolean", default: !0, title: "Frame on Start", description: 'Frames the entity or scene at the start of the application."' }), Object.defineProperty(OrbitCamera.prototype, "distance", { get: function() { return this._targetDistance }, set: function(t) { this._targetDistance = this._clampDistance(t) } }), Object.defineProperty(OrbitCamera.prototype, "pitch", { get: function() { return this._targetPitch }, set: function(t) { this._targetPitch = this._clampPitchAngle(t) } }), Object.defineProperty(OrbitCamera.prototype, "yaw", {
    get: function() { return this._targetYaw },
    set: function(t) {
        this._targetYaw = t;
        var i = (this._targetYaw - this._yaw) % 360;
        this._targetYaw = i > 180 ? this._yaw - (360 - i) : i < -180 ? this._yaw + (360 + i) : this._yaw + i
    }
}), Object.defineProperty(OrbitCamera.prototype, "pivotPoint", { get: function() { return this._pivotPoint }, set: function(t) { this._pivotPoint.copy(t) } }), OrbitCamera.prototype.focus = function(t) {
    this._buildAabb(t, 0);
    var i = this._modelsAabb.halfExtents,
        e = Math.max(i.x, Math.max(i.y, i.z));
    e /= Math.tan(.5 * this.entity.camera.fov * pc.math.DEG_TO_RAD), e *= 2, this.distance = e, this._removeInertia(), this._pivotPoint.copy(this._modelsAabb.center)
}, OrbitCamera.distanceBetween = new pc.Vec3, OrbitCamera.prototype.resetAndLookAtPoint = function(t, i) {
    this.pivotPoint.copy(i), this.entity.setPosition(t), this.entity.lookAt(i);
    var e = OrbitCamera.distanceBetween;
    e.sub2(i, t), this.distance = e.length(), this.pivotPoint.copy(i);
    var a = this.entity.getRotation();
    this.yaw = this._calcYaw(a), this.pitch = this._calcPitch(a, this.yaw), this._removeInertia(), this._updatePosition()
}, OrbitCamera.prototype.resetAndLookAtEntity = function(t, i) { this._buildAabb(i, 0), this.resetAndLookAtPoint(t, this._modelsAabb.center) }, OrbitCamera.prototype.reset = function(t, i, e) { this.pitch = i, this.yaw = t, this.distance = e, this._removeInertia() }, OrbitCamera.prototype.initialize = function() {
    var t = this,
        onWindowResize = function() { t._checkAspectRatio() };
    window.addEventListener("resize", onWindowResize, !1), this._checkAspectRatio(), this._modelsAabb = new pc.BoundingBox, this._buildAabb(this.focusEntity || this.app.root, 0), this.entity.lookAt(this._modelsAabb.center), this._pivotPoint = new pc.Vec3, this._pivotPoint.copy(this._modelsAabb.center);
    var i = this.entity.getRotation();
    if (this._yaw = this._calcYaw(i), this._pitch = this._clampPitchAngle(this._calcPitch(i, this._yaw)), this.entity.setLocalEulerAngles(this._pitch, this._yaw, 0), this._distance = 0, this._targetYaw = this._yaw, this._targetPitch = this._pitch, this.frameOnStart) this.focus(this.focusEntity || this.app.root);
    else {
        var e = new pc.Vec3;
        e.sub2(this.entity.getPosition(), this._pivotPoint), this._distance = this._clampDistance(e.length())
    }
    this._targetDistance = this._distance, this.on("attr:distanceMin", (function(t, i) { this._targetDistance = this._clampDistance(this._distance) })), this.on("attr:distanceMax", (function(t, i) { this._targetDistance = this._clampDistance(this._distance) })), this.on("attr:pitchAngleMin", (function(t, i) { this._targetPitch = this._clampPitchAngle(this._pitch) })), this.on("attr:pitchAngleMax", (function(t, i) { this._targetPitch = this._clampPitchAngle(this._pitch) })), this.on("attr:focusEntity", (function(t, i) { this.frameOnStart ? this.focus(t || this.app.root) : this.resetAndLookAtEntity(this.entity.getPosition(), t || this.app.root) })), this.on("attr:frameOnStart", (function(t, i) { t && this.focus(this.focusEntity || this.app.root) })), this.on("destroy", (function() { window.removeEventListener("resize", onWindowResize, !1) }))
}, OrbitCamera.prototype.update = function(t) {
    var i = 0 === this.inertiaFactor ? 1 : Math.min(t / this.inertiaFactor, 1);
    this._distance = pc.math.lerp(this._distance, this._targetDistance, i), this._yaw = pc.math.lerp(this._yaw, this._targetYaw, i), this._pitch = pc.math.lerp(this._pitch, this._targetPitch, i), this._updatePosition()
}, OrbitCamera.prototype._updatePosition = function() {
    this.entity.setLocalPosition(0, 0, 0), this.entity.setLocalEulerAngles(this._pitch, this._yaw, 0);
    var t = this.entity.getPosition();
    t.copy(this.entity.forward), t.scale(-this._distance), t.add(this.pivotPoint), this.entity.setPosition(t)
}, OrbitCamera.prototype._removeInertia = function() { this._yaw = this._targetYaw, this._pitch = this._targetPitch, this._distance = this._targetDistance }, OrbitCamera.prototype._checkAspectRatio = function() {
    var t = this.app.graphicsDevice.height,
        i = this.app.graphicsDevice.width;
    this.entity.camera.horizontalFov = t > i
}, OrbitCamera.prototype._buildAabb = function(t, i) {
    var e, a = 0,
        n = 0;
    if (t instanceof pc.Entity) {
        var s = [],
            r = t.findComponents("render");
        for (a = 0; a < r.length; ++a)
            for (e = r[a].meshInstances, n = 0; n < e.length; n++) s.push(e[n]);
        var h = t.findComponents("model");
        for (a = 0; a < h.length; ++a)
            for (e = h[a].meshInstances, n = 0; n < e.length; n++) s.push(e[n]);
        for (a = 0; a < s.length; a++) 0 === i ? this._modelsAabb.copy(s[a].aabb) : this._modelsAabb.add(s[a].aabb), i += 1
    }
    for (a = 0; a < t.children.length; ++a) i += this._buildAabb(t.children[a], i);
    return i
}, OrbitCamera.prototype._calcYaw = function(t) { var i = new pc.Vec3; return t.transformVector(pc.Vec3.FORWARD, i), Math.atan2(-i.x, -i.z) * pc.math.RAD_TO_DEG }, OrbitCamera.prototype._clampDistance = function(t) { return this.distanceMax > 0 ? pc.math.clamp(t, this.distanceMin, this.distanceMax) : Math.max(t, this.distanceMin) }, OrbitCamera.prototype._clampPitchAngle = function(t) { return pc.math.clamp(t, -this.pitchAngleMax, -this.pitchAngleMin) }, OrbitCamera.quatWithoutYaw = new pc.Quat, OrbitCamera.yawOffset = new pc.Quat, OrbitCamera.prototype._calcPitch = function(t, i) {
    var e = OrbitCamera.quatWithoutYaw,
        a = OrbitCamera.yawOffset;
    a.setFromEulerAngles(0, -i, 0), e.mul2(a, t);
    var n = new pc.Vec3;
    return e.transformVector(pc.Vec3.FORWARD, n), Math.atan2(n.y, -n.z) * pc.math.RAD_TO_DEG
};
var MouseInput = pc.createScript("mouseInput");
MouseInput.attributes.add("orbitSensitivity", { type: "number", default: .3, title: "Orbit Sensitivity", description: "How fast the camera moves around the orbit. Higher is faster" }), MouseInput.attributes.add("distanceSensitivity", { type: "number", default: .15, title: "Distance Sensitivity", description: "How fast the camera moves in and out. Higher is faster" }), MouseInput.prototype.initialize = function() {
    if (this.orbitCamera = this.entity.script.orbitCamera, this.orbitCamera) {
        var t = this,
            onMouseOut = function(o) { t.onMouseOut(o) };
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this), this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this), this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this), this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this), window.addEventListener("mouseout", onMouseOut, !1), this.on("destroy", (function() { this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this), this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this), this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this), this.app.mouse.off(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this), window.removeEventListener("mouseout", onMouseOut, !1) }))
    }
    this.app.mouse.disableContextMenu(), this.lookButtonDown = !1, this.panButtonDown = !1, this.lastPoint = new pc.Vec2
}, MouseInput.fromWorldPoint = new pc.Vec3, MouseInput.toWorldPoint = new pc.Vec3, MouseInput.worldDiff = new pc.Vec3, MouseInput.prototype.pan = function(t) {
    var o = MouseInput.fromWorldPoint,
        e = MouseInput.toWorldPoint,
        i = MouseInput.worldDiff,
        s = this.entity.camera,
        n = this.orbitCamera.distance;
    s.screenToWorld(t.x, t.y, n, o), s.screenToWorld(this.lastPoint.x, this.lastPoint.y, n, e), i.sub2(e, o), this.orbitCamera.pivotPoint.add(i)
}, MouseInput.prototype.onMouseDown = function(t) {
    switch (t.button) {
        case pc.MOUSEBUTTON_LEFT:
            this.lookButtonDown = !0;
            break;
        case pc.MOUSEBUTTON_MIDDLE:
        case pc.MOUSEBUTTON_RIGHT:
            this.panButtonDown = !0
    }
}, MouseInput.prototype.onMouseUp = function(t) {
    switch (t.button) {
        case pc.MOUSEBUTTON_LEFT:
            this.lookButtonDown = !1;
            break;
        case pc.MOUSEBUTTON_MIDDLE:
        case pc.MOUSEBUTTON_RIGHT:
            this.panButtonDown = !1
    }
}, MouseInput.prototype.onMouseMove = function(t) {
    pc.app.mouse;
    this.lookButtonDown ? (this.orbitCamera.pitch -= t.dy * this.orbitSensitivity, this.orbitCamera.yaw -= t.dx * this.orbitSensitivity) : this.panButtonDown && this.pan(t), this.lastPoint.set(t.x, t.y)
}, MouseInput.prototype.onMouseWheel = function(t) { this.orbitCamera.distance -= t.wheel * this.distanceSensitivity * (.1 * this.orbitCamera.distance), t.event.preventDefault() }, MouseInput.prototype.onMouseOut = function(t) { this.lookButtonDown = !1, this.panButtonDown = !1 };
var TouchInput = pc.createScript("touchInput");
TouchInput.attributes.add("orbitSensitivity", { type: "number", default: .4, title: "Orbit Sensitivity", description: "How fast the camera moves around the orbit. Higher is faster" }), TouchInput.attributes.add("distanceSensitivity", { type: "number", default: .2, title: "Distance Sensitivity", description: "How fast the camera moves in and out. Higher is faster" }), TouchInput.prototype.initialize = function() { this.orbitCamera = this.entity.script.orbitCamera, this.lastTouchPoint = new pc.Vec2, this.lastPinchMidPoint = new pc.Vec2, this.lastPinchDistance = 0, this.orbitCamera && this.app.touch && (this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStartEndCancel, this), this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchStartEndCancel, this), this.app.touch.on(pc.EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this), this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this), this.on("destroy", (function() { this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStartEndCancel, this), this.app.touch.off(pc.EVENT_TOUCHEND, this.onTouchStartEndCancel, this), this.app.touch.off(pc.EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this), this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this) }))) }, TouchInput.prototype.getPinchDistance = function(t, i) {
    var o = t.x - i.x,
        n = t.y - i.y;
    return Math.sqrt(o * o + n * n)
}, TouchInput.prototype.calcMidPoint = function(t, i, o) { o.set(i.x - t.x, i.y - t.y), o.scale(.5), o.x += t.x, o.y += t.y }, TouchInput.prototype.onTouchStartEndCancel = function(t) {
    var i = t.touches;
    1 == i.length ? this.lastTouchPoint.set(i[0].x, i[0].y) : 2 == i.length && (this.lastPinchDistance = this.getPinchDistance(i[0], i[1]), this.calcMidPoint(i[0], i[1], this.lastPinchMidPoint))
}, TouchInput.fromWorldPoint = new pc.Vec3, TouchInput.toWorldPoint = new pc.Vec3, TouchInput.worldDiff = new pc.Vec3, TouchInput.prototype.pan = function(t) {
    var i = TouchInput.fromWorldPoint,
        o = TouchInput.toWorldPoint,
        n = TouchInput.worldDiff,
        h = this.entity.camera,
        c = this.orbitCamera.distance;
    h.screenToWorld(t.x, t.y, c, i), h.screenToWorld(this.lastPinchMidPoint.x, this.lastPinchMidPoint.y, c, o), n.sub2(o, i), this.orbitCamera.pivotPoint.add(n)
}, TouchInput.pinchMidPoint = new pc.Vec2, TouchInput.prototype.onTouchMove = function(t) {
    var i = TouchInput.pinchMidPoint,
        o = t.touches;
    if (1 == o.length) {
        var n = o[0];
        this.orbitCamera.pitch -= (n.y - this.lastTouchPoint.y) * this.orbitSensitivity, this.orbitCamera.yaw -= (n.x - this.lastTouchPoint.x) * this.orbitSensitivity, this.lastTouchPoint.set(n.x, n.y)
    } else if (2 == o.length) {
        var h = this.getPinchDistance(o[0], o[1]),
            c = h - this.lastPinchDistance;
        this.lastPinchDistance = h, this.orbitCamera.distance -= c * this.distanceSensitivity * .1 * (.1 * this.orbitCamera.distance), this.calcMidPoint(o[0], o[1], i), this.pan(i), this.lastPinchMidPoint.copy(i)
    }
};
var AnimationEvents = pc.createScript("animation-event-listener");

function setIntervalX(t, e, i) {
    var n = 0,
        s = window.setInterval((function() { t(n), ++n === i && window.clearInterval(s) }), e)
}
AnimationEvents.attributes.add("shoeEntity", { type: "entity", description: "The entity shoe" }), AnimationEvents.attributes.add("particles", { type: "entity", description: "Particle System entity" }), AnimationEvents.prototype.initialize = function() {
    this.entity.anim.on("pistol_near", (function(t) {
        console.log("near!");
        const e = this.shoeEntity.render.meshInstances[0].material;
        setIntervalX((t => { t % 2 == 0 ? e.emissive.set(.5, 0, 0) : e.emissive.set(0, 0, 0), e.update() }), 125, 8)
    }), this), this.entity.anim.on("start_rfid_wave", (function(t) { console.log("RFID waves!"), this.particles.particlesystem.play(), window.setTimeout((() => { this.particles.particlesystem.reset() }), 1e3) }), this)
};
var ButtonLogic = pc.createScript("ui-button");
ButtonLogic.attributes.add("animEntity", { type: "entity", description: "The entity that we want to update when the button is clicked" });
var animating = !1;
ButtonLogic.prototype.initialize = function() { this.app.on("AnimateModel", (() => { animating || (this.animEntity.anim.setTrigger("Animate"), console.log(this.animEntity.anim), animating = !0, window.setTimeout((() => { animating = !1 }), 3500)) }), this) };
var Ar = pc.createScript("ar");
const HAS_RESIZE_OBSERVER = null != self.ResizeObserver,
    HAS_INTERSECTION_OBSERVER = null != self.IntersectionObserver,
    IS_MOBILE = (() => { const e = navigator.userAgent || navigator.vendor; let t = !1; return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(e) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(e.substr(0, 4))) && (t = !0), t })(),
    IS_CHROMEOS = /\bCrOS\b/.test(navigator.userAgent),
    IS_ANDROID = /android/i.test(navigator.userAgent),
    IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !self.MSStream || "MacIntel" === navigator.platform && navigator.maxTouchPoints > 1,
    IS_AR_QUICKLOOK_CANDIDATE = (() => { const e = document.createElement("a"); return Boolean(e.relList && e.relList.supports && e.relList.supports("ar")) })(),
    IS_SAFARI = /Safari\//.test(navigator.userAgent),
    IS_FIREFOX = /firefox/i.test(navigator.userAgent),
    IS_OCULUS = /OculusBrowser/.test(navigator.userAgent),
    IS_IOS_CHROME = IS_IOS && /CriOS\//.test(navigator.userAgent),
    IS_IOS_SAFARI = IS_IOS && IS_SAFARI,
    IS_SCENEVIEWER_CANDIDATE = IS_ANDROID && !IS_FIREFOX && !IS_OCULUS;

function SceneViewer() {
    const e = self.location.toString(),
        t = new URL(e),
        o = new URL("files/assets/56146780/1/CTCR_ar.glb", e),
        i = new URLSearchParams(o.search),
        n = "#model-viewer-no-ar-fallback",
        a = document.createElement("a");
    if (t.hash = n, i.set("mode", "ar_preferred"), i.has("disable_occlusion") || i.set("disable_occlusion", "true"), "fixed" === this.arScale && i.set("resizable", "false"), "wall" === this.arPlacement && i.set("enable_vertical_placement", "true"), i.has("sound")) {
        const t = new URL(i.get("sound"), e);
        i.set("sound", t.toString())
    }
    if (i.has("link")) {
        const t = new URL(i.get("link"), e);
        i.set("link", t.toString())
    }
    const r = `intent://arvr.google.com/scene-viewer/1.0?${i.toString()+"&file="+encodeURIComponent(o.toString())}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(t.toString())};end;`;
    self.addEventListener("hashchange", (() => { self.location.hash === n && (isSceneViewerBlocked = !0, self.history.back(), console.warn("Error while trying to present in AR with Scene Viewer"), console.warn("Falling back to next ar-mode"), this[$selectARMode]()) }), { once: !0 }), a.setAttribute("href", r), console.log("Attempting to present in AR with Scene Viewer..."), a.click()
}

function QuickLook() {
    const e = document.createElement("a"),
        t = new URL("files/assets/56146780/1/CTCR.usdz", self.location.toString());
    "fixed" === this.arScale && (t.hash && (t.hash += "&"), t.hash += "allowsContentScaling=0");
    const o = e;
    o.setAttribute("rel", "ar");
    const i = document.createElement("img");
    o.appendChild(i), o.setAttribute("href", t.toString()), console.log("Attempting to present in AR with Quick Look..."), o.click(), o.removeChild(i)
}
Ar.prototype.initialize = function() { IS_MOBILE ? this.app.on("ARShow", (() => { IS_SCENEVIEWER_CANDIDATE ? SceneViewer() : IS_AR_QUICKLOOK_CANDIDATE ? QuickLook() : console.log("Nothing!") }), this) : document.getElementById("ar-button").style.display = "NONE" };
pc.script.createLoadingScreen((function(e) {
    var t, a;
    t = ["body {", "    background-color: #FFFFFF;", "}", "", "#application-splash-wrapper {", "    position: absolute;", "    top: 0;", "    left: 0;", "    height: 100%;", "    width: 100%;", "    background-color: #FFFFFF;", "}", "", "#application-splash {", "    position: absolute;", "    top: calc(50% - 28px);", "    width: 264px;", "    left: calc(50% - 132px);", "}", "", "#application-splash img {", "    width: 100%;", "}", "", "#progress-bar-container {", "    margin: 20px auto 0 auto;", "    height: 2px;", "    width: 100%;", "    background-color: #1d292c;", "}", "", "#progress-bar {", "    width: 0%;", "    height: 100%;", "    background-color: #f60;", "}", "", "@media (max-width: 480px) {", "    #application-splash {", "        width: 170px;", "        left: calc(50% - 85px);", "    }", "}"].join("\n"), (a = document.createElement("style")).type = "text/css", a.styleSheet ? a.styleSheet.cssText = t : a.appendChild(document.createTextNode(t)), document.head.appendChild(a),
        function() {
            var e = document.createElement("div");
            e.id = "application-splash-wrapper", document.body.appendChild(e);
            var t = document.createElement("div");
            t.id = "application-splash", e.appendChild(t), t.style.display = "none";
            var a = document.createElement("img");
            a.src = "https://playcanvas.com/static-assets/images/play_text_252_white.png", t.appendChild(a), a.onload = function() { t.style.display = "block" };
            var o = document.createElement("div");
            o.id = "progress-bar-container", t.appendChild(o);
            var p = document.createElement("div");
            p.id = "progress-bar", o.appendChild(p)
        }(), e.on("preload:end", (function() { e.off("preload:progress") })), e.on("preload:progress", (function(e) {
            var t = document.getElementById("progress-bar");
            t && (e = Math.min(1, Math.max(0, e)), t.style.width = 100 * e + "%")
        })), e.on("start", (function() {
            var e = document.getElementById("application-splash-wrapper");
            e.parentElement.removeChild(e)
        }))
}));
var Ui = pc.createScript("ui");
Ui.attributes.add("css", { type: "asset", assetType: "css", title: "CSS Asset" }), Ui.attributes.add("html", { type: "asset", assetType: "html", title: "HTML Asset" }), Ui.prototype.initialize = function() {
    var t = document.createElement("style");
    document.head.appendChild(t), t.innerHTML = this.css.resource || "", this.div = document.createElement("div"), this.div.classList.add("container"), this.div.innerHTML = this.html.resource || "", document.body.appendChild(this.div), this.counter = 0, this.bindEvents()
}, Ui.prototype.bindEvents = function() {
    var t = this.div.querySelector(".animate-button"),
        e = this.div.querySelector(".view-in-ar-button");
    t && t.addEventListener("click", (function() { console.log("animatebutton clicked"), pc.app.fire("AnimateModel") }), !1), e && e.addEventListener("click", (function() { console.log("arbutton clicked"), pc.app.fire("ARShow") }), !1)
};
var LookAt = pc.createScript("look-at");
LookAt.attributes.add("cameraEntity", { type: "entity", description: "The camera Entity" }), LookAt.prototype.initialize = function() { this.directionToCamera = new pc.Vec3 }, LookAt.prototype.update = function(t) {
    var i = this.cameraEntity.getPosition();
    this.entity.lookAt(i), this.directionToCamera.sub2(i, this.entity.getPosition()), this.directionToCamera.normalize()
};
var HotspotDotButton = pc.createScript("hotspotDotButton");
HotspotDotButton.attributes.add("hotspotEntity", { type: "entity", description: "The hotspot Entity" }), HotspotDotButton.prototype.initialize = function() {
    this.hotspotEntity.enabled = !1, this.app.on("HotspotOpen", (() => { this.hotspotEntity.enabled = !1 })), this.entity.element.on("click", (function(t) {
        const o = !this.hotspotEntity.enabled;
        o && this.app.fire("HotspotOpen"), this.hotspotEntity.enabled = o
    }), this)
};
var AssignMaterialImageElement = pc.createScript("assignMaterialImageElement");
AssignMaterialImageElement.attributes.add("materialAsset", { type: "asset" }), AssignMaterialImageElement.prototype.initialize = function() { console.log(this.entity), this.entity.element.material = this.materialAsset.resource };
var Hotspot = pc.createScript("hotspot");
Hotspot.prototype.initialize = function() { this.app.on("AnimateModel", (() => { this.entity.enabled = !1, window.setTimeout((() => { this.entity.enabled = !0 }), 3500) })) };

//# sourceMappingURL=__game-scripts.js.map