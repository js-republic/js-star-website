(function () {
    window.addEventListener('load', () => {
        const microScreenBreakPoint = 400;
        const mobileBreakPoint = 550;
        const tabletBreakPoint = 750;
        const desktopBreakPoint = 1000;

        const body = document.body;

        function shadeColor(color, percent) {
            var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
            return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
        }

        function debounce(func, wait, immediate) {
            var timeout;
            return function () {
                var context = this, args = arguments;
                var later = function () {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        }

        function addMiniatureOnDesktop() {
            let positionScreenPreviewInMiniature;

            function apply() {
                const bodyRect = body.getBoundingClientRect();
                const bodyHeight = bodyRect.height;
                const bodyWidth = bodyRect.width;
                const wHeight = window.outerHeight;

                window.removeEventListener('scroll', positionScreenPreviewInMiniature);
                let miniatureContainer = document.querySelector('#miniature-container');
                if (bodyWidth >= desktopBreakPoint) {
                    miniatureContainer = miniatureContainer || buildMiniature();
                    miniatureContainer.style.opacity = "1";

                    const screenPreview = miniatureContainer.querySelector('.screen-preview');
                    const miniatureWidth = miniatureContainer.getBoundingClientRect().width;
                    const miniBody = miniatureContainer.firstChild;
                    const coef = miniatureWidth / bodyWidth;

                    miniBody.style.width = `${bodyWidth}px`;
                    miniBody.style.transform = `scale(${coef})`;
                    miniatureContainer.style.height = `${bodyHeight * coef}px`;
                    screenPreview.style.height = `${wHeight * coef}px`;

                    positionScreenPreviewInMiniature = buildPositionScreenPreviewInMiniatureScrollHandler(screenPreview, coef);
                    positionScreenPreviewInMiniature();
                    window.addEventListener('scroll', positionScreenPreviewInMiniature);
                } else if (miniatureContainer) {
                    miniatureContainer.style.opacity = "0";
                }
            }

            apply();
            window.addEventListener('resize', debounce(apply, 250));
        }

        function buildMiniature() {
            const miniatureContainer = buildMiniatureContainer();
            const miniBody = buildDiv("mini-body");

            Array.prototype.forEach.call(body.childNodes, (el)=> {
                if (el.tagName === 'HEADER' || el.tagName === 'FOOTER' || el.tagName === 'SECTION' || el.tagName === 'DIV') {
                    miniBody.appendChild(el.cloneNode(true));
                }
            });

            miniatureContainer.appendChild(miniBody);
            miniatureContainer.appendChild(buildDiv("over-my-mini-body"));
            miniatureContainer.appendChild(buildDiv("screen-preview"));
            body.appendChild(miniatureContainer);
            return miniatureContainer;
        }

        function buildDiv(className) {
            const screenPreview = document.createElement('div');
            screenPreview.className = className;
            return screenPreview;
        }

        function buildMiniatureContainer() {
            const miniatureContainer = document.createElement('div');
            miniatureContainer.id = "miniature-container";
            return miniatureContainer;
        }

        function buildPositionScreenPreviewInMiniatureScrollHandler(screenPreview, coef) {
            return debounce(()=> {
                const scrollTop = document.body.scrollTop;
                screenPreview.style.top = `${scrollTop * coef}px`;
            });
        }

        function addClass(el, clazzz) {
            const clazzzList = clazzz.split(' ');
            clazzzList.forEach((clazz)=> {
                const idx = el.className.indexOf(clazz);
                if (idx === -1) {
                    el.className = `${el.className} ${clazz}`.trim();
                }
            });
        }

        function removeClass(el, clazzz) {
            const clazzzList = clazzz.split(' ');
            clazzzList.forEach((clazz)=> {
                const idx = el.className.indexOf(clazz);
                if (idx !== -1) {
                    const afterClazz = el.className.slice(idx + clazz.length + 1, el.className.length);
                    const beforeClazz = el.className.slice(0, Math.max(idx - 1, 0));
                    el.className = (beforeClazz + " " + afterClazz).trim();
                }
            });
        }

        function watchForStickyHeader() {
            const $headers = document.querySelectorAll('header');

            function apply() {
                const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

                if (scrollTop >= 30) {
                    addClass(body, 'sticky');
                    Array.prototype.forEach.call($headers, ($header)=> {
                        removeClass($header, 'expanded');
                    });
                } else {
                    Array.prototype.forEach.call($headers, ($header)=> {
                        addClass($header, 'expanded');
                    });
                    removeClass(body, 'sticky');
                }
            }

            apply();
            window.addEventListener('scroll', debounce(apply, 5));
            window.addEventListener('resize', debounce(apply, 10));
        }

        function startColorSwitching() {
            const wWidth = window.innerWidth;
            const $colorizer = document.querySelector("#colorizer");
            const $colorizedEls = document.querySelectorAll('.colorized, .colorized-bg');
            let colorizerContent = '';

            if (wWidth <= tabletBreakPoint) {
                const colors = [
                    {percent: 0, color: "#cb0f38"},
                    {percent: 12.5, color: "#008ccb"},
                    {percent: 37.5, color: "#00caa5"},
                    {percent: 62.5, color: "#cab200"},
                    {percent: 87.5, color: "#cb057e"},
                    {percent: 100, color: "#cb0f38"}
                ];
                const randomIdx = random(colors.length - 1);
                const color = colors[randomIdx].color;
                colorizerContent = `
                .colorized{color : ${color};}
                .colorized-bg{background-color : ${color};}
                .colorized.freeze-mobile { color: #000; }
                #talk-talk-talk input.colorized-bg {background-color : ${color}; border-bottom-color : ${shadeColor(color, -0.3)};}
            `;
            }
            else {
                const colors = ["#cb0f38", "#008ccb", "#00caa5", "#cab200", "#cb057e"];
                let lastTimestamp = null;
                let colorIdx = 0;
                const changePeriod = 5000;
                var step = (timestamp)=> {
                    if (lastTimestamp === null || changePeriod <= (timestamp - lastTimestamp)) {
                        lastTimestamp = timestamp;
                        const color = colors[colorIdx];
                        $colorizer.innerHTML = `
                        .colorized.active { color: ${color}; }
                        .colorized-bg.active {
                            background-color: ${color};
                            color: ${shadeColor(color, 0.7)};
                        }
                        #talk-talk-talk input.colorized-bg.active{
                            border:0;
                            background-color: ${color};
                            border-bottom : 2px solid ${shadeColor(color, -0.3)};
                        }`;
                        colorIdx = (++colorIdx < colors.length ) ? colorIdx : 0;
                    }
                    window.requestAnimationFrame(step);
                };
                window.requestAnimationFrame(step);
                function apply() {
                    Array.prototype.forEach.call($colorizedEls, ($colorizedEl)=> {
                        if (isInViewport($colorizedEl)) {
                            addClass($colorizedEl, 'active');
                        } else {
                            removeClass($colorizedEl, 'active');
                        }
                    });
                }

                apply();
                window.addEventListener('resize', debounce(apply, 10));
                window.addEventListener('scroll', debounce(apply, 10));
            }
            $colorizer.innerHTML = colorizerContent;
        }

        function startTextSwitching() {
            const tools = ["React", "Angular", "Polymer"];
            const platforms = ["ES6/ES7", 'TypeScript', 'Flow'];
            const industrialisation = ["Webpack", "JSPM", "GulpJs"];
            let lastTimestamp = null;
            let textIdx = 0;
            const changePeriod = 3000;
            const $tools = document.querySelector('.hexagone .tools');
            const $plateforms = document.querySelector('.hexagone .platforms');
            const $industrialisation = document.querySelector('.hexagone .industrialisation');
            var step = (timestamp)=> {
                if (lastTimestamp === null || changePeriod <= (timestamp - lastTimestamp)) {
                    lastTimestamp = timestamp;
                    $tools.innerText = tools[textIdx];
                    $plateforms.innerText = platforms[textIdx];
                    $industrialisation.innerText = industrialisation[textIdx];

                    textIdx = (++textIdx < platforms.length ) ? textIdx : 0;
                }
                window.requestAnimationFrame(step);
            };
            window.requestAnimationFrame(step);
        }

        function isInViewport(element) {
            const margin = 500;
            const rect = element.getBoundingClientRect();
            return !(rect.top > window.innerHeight + margin || rect.bottom < -margin );
        }

        function handleMenu() {
            const btn = document.querySelector('#toggle-menu');
            const navContainer = document.querySelector('#nav-container');
            const aEls = navContainer.querySelectorAll('a');
            const toggleMenu = ()=> {
                const isOpen = btn.className.indexOf('open') !== -1;
                if (isOpen) {
                    btn.className = '';
                    navContainer.className = '';
                    Array.prototype.forEach.call(aEls, (aEl)=> {
                        aEl.removeEventListener('click', toggleMenu);
                    });
                }
                else {
                    btn.className = "open";
                    navContainer.className = "open";
                    Array.prototype.forEach.call(aEls, (aEl)=> {
                        aEl.addEventListener('click', toggleMenu);
                    });
                }
            };
            btn.addEventListener('click', toggleMenu);
        }

        function handleGyro() {
            const wWidth = window.innerWidth;
            if (wWidth <= desktopBreakPoint) {
                gyro.stopTracking();
                gyro.calibrate();
                const $header = document.querySelector('header');
                const speed = 0.01;
                const margin = 5;
                const maxLeft = -1920 - margin + window.innerWidth;
                const maxTop = -1024 - margin + window.innerHeight;
                let position = {top: random(maxLeft), left: random(maxTop + 200)};

                let lastTimestamp = null;
                const step = function(timestamp) {
                    if (lastTimestamp !== null) {
                        const delay = timestamp - lastTimestamp;
                        const o = gyro.getOrientation();
                        const step = speed * delay;
                        position = {
                            left: Math.max(maxLeft, Math.min(margin, position.left - (o.gamma * step))),
                            top: Math.max(maxTop, Math.min(margin, position.top - (o.beta * step)))
                        };
                        $header.style['background-position'] = `${position.left}px ${position.top}px`;
                    }
                    lastTimestamp = timestamp;
                    window.requestAnimationFrame(step);
                };
                window.requestAnimationFrame(step);
            }
        }

        function roundDecimal(nombre, precision) {
            precision = precision || 2;
            var tmp = Math.pow(10, precision);
            return Math.trunc(Math.round(nombre * tmp) / tmp, precision);
        }

        function handleForm() {
            const $form = document.querySelector('#contact-us');
            const $submit = $form.querySelector('#submit');
            $form.addEventListener('submit', (event)=> {
                event.preventDefault();
                const intention = $form.querySelector('select[name=intention]').value;
                const fullName = $form.querySelector('input[name=fullName]').value;
                const mail = $form.querySelector('input[name=mail]').value;
                const about = $form.querySelector('select[name=about]').value;
                const salutation = $form.querySelector('select[name=salutation]').value;

                const request = new XMLHttpRequest();
                request.open("POST", "/contact-us");
                request.setRequestHeader("Content-type", "application/json");
                request.onload = () => {
                    //$submit.disabled = true;
                    const content = $submit.querySelector('.content');
                    if (request.status == 200) {
                        content.innerHTML = "Envoyé !";
                        $submit.disable = true;
                    } else {
                        content.innerHTML = "Echec de l'envoi";
                    }
                };
                request.send(JSON.stringify({
                    intention,
                    fullName,
                    mail,
                    about,
                    salutation
                }));
            }, false);
        }


        function handleKonamiCode() {
            new Konami(()=> {
                const overlay = document.createElement('div');
                overlay.id = "konami-overlay";
                overlay.innerHTML = `<div class="video"><iframe width="560" height="315" src="https://www.youtube.com/embed/m2kl3qp-vg4?autoplay=1" frameborder="0" allowfullscreen></iframe></div>`;
                body.appendChild(overlay);
            });
        }

        function loadSelects() {
            const request = new XMLHttpRequest();
            request.open("GET", "/form-lists");
            request.setRequestHeader("Content-type", "application/json");
            request.onload = () => {
                if (request.status == 200) {
                    const lists = JSON.parse(request.responseText);
                    const $form = document.querySelector('#contact-us');
                    const intention = $form.querySelector('select[name=intention]');
                    const about = $form.querySelector('select[name=about]');
                    const salutation = $form.querySelector('select[name=salutation]');
                    fillWithOption(intention, lists.intentions);
                    fillWithOption(about, lists.abouts);
                    fillWithOption(salutation, lists.salutations);
                }
            };
            request.send();
        }

        function fillWithOption(selectEl, list) {
            for (var val in list) {
                if (list.hasOwnProperty(val)) {
                    const option = document.createElement('option');
                    option.value = val;
                    option.innerText = list[val];
                    selectEl.appendChild(option);
                }
            }
        }

        function logDevMsg() {
            if (!isMobileUserAgent()) {
                const request = new XMLHttpRequest();
                request.open("GET", "/ascii-content");
                request.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
                request.onload = () => {
                    if (request.status == 200) {
                        console.log(request.responseText);
                    }
                };
                request.send();
            }
        }

        function loadArticles() {
            const articlesEl = document.querySelector('.articles');
            const request = new XMLHttpRequest();
            request.open("GET", "/articles");
            request.setRequestHeader("Content-type", "application/json");
            request.onload = () => {
                if (request.status == 200) {
                    const articles = JSON.parse(request.responseText);
                    articles.forEach(article => {
                        const articleEl = document.createElement('div');
                        const articleTitle = document.createElement('a');
                        articleTitle.href = article.link;
                        articleTitle.innerText = article.title;
                        articleEl.appendChild(articleTitle);
                        articlesEl.appendChild(articleEl);
                    });
                }
            };
            request.send();
        }

        function isMobileUserAgent() {
            var check = false;
            (function (a) {
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))check = true
            })(navigator.userAgent || navigator.vendor || window.opera);
            return check;
        }

        function choosePitchs() {
            const firstParts = [
                `Parce que que le JavaScript est le langage
            commun aux dispositifs innovants.`,
                `Parce que le JavaScript est le Next Big Langage
            permettant de créer des services innovants.`,
                `Parce que le Javascript est la base des services
            multi-écrans et des objets connectés.`
            ];
            const secondParts = [
                `Parce que seuls des développeurs experts peuvent
            concevoir des services fiables.`,
                `Parce que l’expertise fait gagner en temps, en fiabilité
            et donc en capacité d'innovation.`,
                `Parce que nos clients souhaitent une expertise sans faille
            basée sur l’expérience et l’excellence opérationnelle.`
            ];
            const thirdParts = [
                `Nous avons réuni au sein de JS-Republic
            les meilleurs experts JavaScripts.`,
                `Nous avons recruté les meilleurs experts JavaScript
            et les encourageons développer encore leur expertise.`,
                `Nous avons développé une société basée sur l’expertise,
            l’excellence opérationnelle et le talent.`
            ];
            document.querySelector('#pitch .firstPart').innerHTML = firstParts[random(firstParts.length - 1)];
            document.querySelector('#pitch .secondPart').innerHTML = secondParts[random(secondParts.length - 1)];
            document.querySelector('#pitch .thirdPart').innerHTML = thirdParts[random(thirdParts.length - 1)];

        }

        function random(max) {
            return Math.floor((Math.random() * max) + 1);
        }


        choosePitchs();
        handleKonamiCode();
        handleMenu();
        addMiniatureOnDesktop();
        watchForStickyHeader();
        startColorSwitching();
        startTextSwitching();
        loadSelects();
        loadArticles();
        handleForm();
        logDevMsg();
        handleGyro();
        smoothScroll.init({
            offset: isMobileUserAgent() ? 0 : 40
        });
    }, true);
})();