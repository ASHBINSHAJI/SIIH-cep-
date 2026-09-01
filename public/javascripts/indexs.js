document.addEventListener("DOMContentLoaded", function () {

    const daysElement = document.getElementById("days");
    const hoursElement = document.getElementById("hours");
    const minutesElement = document.getElementById("minutes");
    const secondsElement = document.getElementById("seconds");

    // Only run countdown if countdown elements exist
    if (!daysElement || !hoursElement || !minutesElement || !secondsElement) {
        return;
    }

    // 26 September 2026 - 9:00 AM
    const targetDate = new Date(
        2026,
        8,
        18,
        2,
        0,
        0
    ).getTime();


    function updateNumber(element, value) {

        const newValue = String(value).padStart(2, "0");

        if (element.textContent !== newValue) {

            element.textContent = newValue;

            element.classList.remove("change");

            void element.offsetWidth;

            element.classList.add("change");
        }
    }


    function updateCountdown() {

        const now = new Date().getTime();

        const difference = targetDate - now;


        if (difference <= 0) {

            updateNumber(daysElement, 0);
            updateNumber(hoursElement, 0);
            updateNumber(minutesElement, 0);
            updateNumber(secondsElement, 0);

            return;
        }


        const days = Math.floor(
            difference / (1000 * 60 * 60 * 24)
        );


        const hours = Math.floor(
            (difference / (1000 * 60 * 60)) % 24
        );


        const minutes = Math.floor(
            (difference / (1000 * 60)) % 60
        );


        const seconds = Math.floor(
            (difference / 1000) % 60
        );


        updateNumber(daysElement, days);
        updateNumber(hoursElement, hours);
        updateNumber(minutesElement, minutes);
        updateNumber(secondsElement, seconds);
    }


    updateCountdown();

    setInterval(updateCountdown, 1000);

});
document.addEventListener("DOMContentLoaded", function () {

    const navLinks = document.querySelectorAll(".navbar-collapse .nav-link");
    const navbarCollapse = document.querySelector(".navbar-collapse");

    navLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            if (navbarCollapse.classList.contains("show")) {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);

                if (bsCollapse) {
                    bsCollapse.hide();
                }
            }

        });

    });

});


const slider = document.getElementById("membersSlider");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const progress = document.getElementById("sliderProgress");

// Only run slider code if slider elements exist
if (slider && nextBtn && prevBtn && progress) {
    const scrollAmount = 250;

    function updateProgress() {

        const maxScroll =
            slider.scrollWidth - slider.clientWidth;

        const currentScroll = slider.scrollLeft;

        if (maxScroll <= 0) {
            progress.style.width = "100%";
            return;
        }

        const percentage =
            ((currentScroll / maxScroll) * 80) + 20;

        progress.style.width = percentage + "%";
    }


    nextBtn.addEventListener("click", () => {

        slider.scrollBy({
            left: scrollAmount,
            behavior: "smooth"
        });

    });


    prevBtn.addEventListener("click", () => {

        slider.scrollBy({
            left: -scrollAmount,
            behavior: "smooth"
        });

    });

    slider.addEventListener("scroll", updateProgress);


    /* Automatic sliding */

    let autoSlide = setInterval(() => {

        if (
            slider.scrollLeft + slider.clientWidth
            >= slider.scrollWidth - 10
        ) {

            slider.scrollTo({
                left: 0,
                behavior: "smooth"
            });

        } else {

            slider.scrollBy({
                left: scrollAmount,
                behavior: "smooth"
            });

        }

    }, 3500);


    /* Pause while mouse is over slider */

    slider.addEventListener("mouseenter", () => {
        clearInterval(autoSlide);
    });


    slider.addEventListener("mouseleave", () => {

        autoSlide = setInterval(() => {

            if (
                slider.scrollLeft + slider.clientWidth
                >= slider.scrollWidth - 10
            ) {

                slider.scrollTo({
                    left: 0,
                    behavior: "smooth"
                });

            } else {

                slider.scrollBy({
                    left: scrollAmount,
                    behavior: "smooth"
                });

            }

        }, 3500);

    });

    updateProgress();
}
