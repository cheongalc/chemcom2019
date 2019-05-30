if (isOnMobile()) {
	// you are on a mobile device
	$('a.content-nav-link').on('click', function (e) {
		e.preventDefault();
		let hash = this.hash;
		// let currScrollPosition = $('div.content').scrollTop();
		let hashPosition = $(hash).offset().top-15;
		window.scrollTo(0, hashPosition);
		return false;
	});
} else {
	$('a.content-nav-link').on('click', function (e) {
		e.preventDefault();
		let hash = this.hash;
		let currScrollPosition = $('div.content').scrollTop();
		let hashPosition = $(hash).offset().top-70;
		$('div.content').animate({
			scrollTop: currScrollPosition+hashPosition
		}, 1000, 'swing', function () {
			window.location.hash = hash;
		});
		return false;
	});
}


function setupSmoothScrollForCitations() {
	if (isOnMobile()) {
		$('a.citation-link').on('click', function (e) {
			e.preventDefault();
			let hash = this.hash;
			let hashPosition = $(hash).offset().top-15;
			window.scrollTo(0, hashPosition);
			return false;
		});
	} else {
		$('a.citation-link').on('click', function (e) {
			e.preventDefault();
			let hash = this.hash;
			let currScrollPosition = $('div.content').scrollTop();
			let hashPosition = $(hash).offset().top-70;
			$('div.content').animate({
				scrollTop: currScrollPosition+hashPosition
			}, 1000, 'swing', function () {
				window.location.hash = hash;
			});
			return false;
		});
	}
}

function isOnMobile() {
	return navigator.userAgent.match(/(iPod|iPhone|iPad|Android)/);
}