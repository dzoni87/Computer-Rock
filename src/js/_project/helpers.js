const helpers = {
	$win: $(window),
	$html: $('html'),

	init: function() {
		// Check if touch device for hover functionality
		if (('ontouchstart' in window || navigator.msMaxTouchPoints > 0) && window.matchMedia('screen and (max-width: 1024px)').matches) {
			this.$html.addClass('touch');
		} else {
			this.$html.addClass('no-touch');
		}

		// Add loaded class to html, to enable transitions
		this.$win.on('load', () => {
			setTimeout(() => {
				this.$html.addClass('loaded');
			}, 10);
		});
	},
};

export default helpers;
