$('a.nav-link').on('click', function (e) {
	e.preventDefault();
	let hash = this.hash;
	let currScrollPosition = $('div.content').scrollTop();
	let hashPosition = $(hash).offset().top-15;
	$('div.content').animate({
		scrollTop: currScrollPosition+hashPosition
	}, 1000, 'swing', function () {
		window.location.hash = hash;
	});
	return false;
});

function setupSmoothScrollForCitations() {
	$('a.citation-link').on('click', function (e) {
		e.preventDefault();
		let hash = this.hash;
		let currScrollPosition = $('div.content').scrollTop();
		let hashPosition = $(hash).offset().top-15;
		$('div.content').animate({
			scrollTop: currScrollPosition+hashPosition
		}, 1000, 'swing', function () {
			window.location.hash = hash;
		});
		return false;
	});
}