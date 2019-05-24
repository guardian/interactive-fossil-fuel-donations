let scrollTop, windowHeight, currentTarget;

export default {
    init: function() {
        this.bindings();
        this.setValues();
        this.onScroll();
    },

    bindings: function() {
        $(window).scroll(function() {
            this.onScroll();
        }.bind(this));

        $(window).resize(function() {
            this.setValues();
            this.onScroll();
        }.bind(this));
    },

    setValues: function() {
        windowHeight = $(window).height();
    },

    onScroll: function() {
        scrollTop = $(window).scrollTop();

        this.fixVisuals();
        this.setCurrentSlide();
    },

    fixVisuals: function() {
        if (scrollTop > $('.uit-slides').offset().top) {
            $('.uit-visuals').addClass('is-fixed');
        } else {
            $('.uit-visuals').removeClass('is-fixed');
        }
    },

    setCurrentSlide: function() {
        let target;

        $('.uit-slide').each(function(i, el) {
            const elTop = $(el).offset().top;

            if (scrollTop > elTop) {
                target = el;
            }
        }.bind(this));

        target = target == undefined ? 0 : $(target).data('slide');

        if (target !== currentTarget) {
            $('.uit-visuals').attr('data-set', target);
            $('.uit-visuals').trigger('shift');
            currentTarget = target;
        }
    }
};
