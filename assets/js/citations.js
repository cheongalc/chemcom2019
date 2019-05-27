function loadCitations() {
  let citationsFootnoteList = document.getElementsByClassName('citation')
  let citationsListContainer = document.getElementById('citationsListContainer');
  fetch('assets/txt/citations.txt').then(response => response.text()).then(
    txt => {
      txt = txt.split('\n');
      for (i = 0; i < citationsFootnoteList.length; i++) {
        let innerHTML = `[<a id="footnote${i+1}" class='citation-link' href="#citation${i+1}">${i+1}</a>]`;
        citationsFootnoteList[i].innerHTML = innerHTML;
        let descriptionListTitle = document.createElement('dt');
        descriptionListTitle.classList.add('col-sm-2');
        descriptionListTitle.id = `citation${i+1}`;
        descriptionListTitle.innerHTML = `Citation <a class='citation-link' href="#footnote${i+1}">${i+1}</a>`;
        citationsListContainer.appendChild(descriptionListTitle);
        let descriptionListData = document.createElement('dd');
        descriptionListData.classList.add('col-sm-10');
        descriptionListData.innerHTML = txt[i];
        citationsListContainer.appendChild(descriptionListData);
      }
      setupSmoothScrollForCitations();
    }
  );
}