import { addRotaMember, rotaMembers, removeRotaMember } from "../services/data.mjs";

export default {
    name: 'RotaMemberConfiguration',
    data: () => ({ rotaMembers }),
    methods: {
        addRotaMember,
        removeRotaMember
    },
    template: /*html*/`
        <label class="form-label required">Staff on rota</label>
        <div class="row justify-content-center g-2 mb-3" v-for="(rotaMember, index) in rotaMembers" :key="rotaMember.id">
            <div class="col">
                <input type="text" class="form-control" :class="{ 'is-invalid': rotaMember.name === '' }" placeholder="Name" v-model="rotaMember.name" required />
            </div>
            <div class="col d-flex justify-content-center">
                <div class="btn-group" role="group">
                    <input type="checkbox" class="btn-check" name="staff-days" autocomplete="off" :id="'row-' + index + '-staff-days-0'" value="0" v-model="rotaMember.days">
                    <label :for="'row-' + index + '-staff-days-0'" type="button" class="btn">Sun</label>
                    <input type="checkbox" class="btn-check" name="staff-days" autocomplete="off" :id="'row-' + index + '-staff-days-1'" value="1" v-model="rotaMember.days">
                    <label :for="'row-' + index + '-staff-days-1'" type="button" class="btn">Mon</label>
                    <input type="checkbox" class="btn-check" name="staff-days" autocomplete="off" :id="'row-' + index + '-staff-days-2'" value="2" v-model="rotaMember.days">
                    <label :for="'row-' + index + '-staff-days-2'" type="button" class="btn">Tue</label>
                    <input type="checkbox" class="btn-check" name="staff-days" autocomplete="off" :id="'row-' + index + '-staff-days-3'" value="3" v-model="rotaMember.days">
                    <label :for="'row-' + index + '-staff-days-3'" type="button" class="btn">Wed</label>
                    <input type="checkbox" class="btn-check" name="staff-days" autocomplete="off" :id="'row-' + index + '-staff-days-4'" value="4" v-model="rotaMember.days">
                    <label :for="'row-' + index + '-staff-days-4'" type="button" class="btn">Thu</label>
                    <input type="checkbox" class="btn-check" name="staff-days" autocomplete="off" :id="'row-' + index + '-staff-days-5'" value="5" v-model="rotaMember.days">
                    <label :for="'row-' + index + '-staff-days-5'" type="button" class="btn">Fri</label>
                    <input type="checkbox" class="btn-check" name="staff-days" autocomplete="off" :id="'row-' + index + '-staff-days-6'" value="6" v-model="rotaMember.days">
                    <label :for="'row-' + index + '-staff-days-6'" type="button" class="btn">Sat</label>
                </div>
            </div>
            <div class="col-1">
                <button class="btn btn-icon" aria-label="Remove row" @click="removeRotaMember(rotaMember.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="d-flex justify-content-center">
            <button class="btn btn-icon" @click="addRotaMember">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                </svg>
            </button>
        </div>`
}