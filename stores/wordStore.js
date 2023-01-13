import {create} from 'zustand'
import { persist, devtools } from "zustand/middleware"


const store = (set) => ({
    favWords: [],

    handleClick: (word) =>
        set((state) => {
            const favWords = [...state.favWords]
            const index = favWords.findIndex(w => w == word)
            if (index != -1) { //if word is already favorited, remove it
                favWords.splice(index, 1)
                return { ...state, favWords }
            }
            else //add it
                return { ...state, favWords: [...state.favWords, word] }
        })
});

export const wordsStore = create(devtools(persist(store, { name: "fav-words" })));