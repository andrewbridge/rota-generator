import { css } from "../deps/goober.mjs";

const styles = css``;

export default {
    name: 'Viewer',
    template: /*html*/`
        <div class="page-body ${styles}">
            <div class="container-xl">
                <div class="row row-cards">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex">
                                    <ul class="pagination mb-0">
                                        <li class="page-item disabled">
                                            <a class="page-link" href="#" tabindex="-1" aria-disabled="true">
                                                <!-- Download SVG icon from http://tabler.io/icons/icon/chevron-left -->
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-1"><path d="M15 6l-6 6l6 6"></path></svg>
                                            </a>
                                        </li>
                                        <li class="page-item"><span class="page-link">Week 1</span></li>
                                        <li class="page-item">
                                            <a class="page-link" href="#">
                                                <!-- Download SVG icon from http://tabler.io/icons/icon/chevron-right -->
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-1"><path d="M9 6l6 6l-6 6"></path></svg>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="card-body">
                                <p>Testing</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
}