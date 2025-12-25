import { supabase } from './supabase-config.js';

const card = document.getElementById("card");
const addStampBtn = document.getElementById("addStampBtn");
const resetCardBtn = document.getElementById("resetCardBtn");
const message = document.getElementById("message");
const totalCounterEl = document.getElementById("totalCounter");

const TABS = {
    myFault: {
        label: "Na Siebie",
        themeColor: "#1b6be3ff",
        stampSrc: "dachshund.svg",
        messages: [
            "🎉 Kartka pełna!<br>😈 No i oczywiście… znowu na Ciebie.",
            "🎉 Uzbierało się!<br>🤡 Gratulacje, wygrałaś kartę winy.",
            "🎉 Komplet!<br>🫠 Czy ktoś jeszcze pamięta, za co były te pieczątki?",
            "🎉 Proroctwo się spełniło!<br>🧙‍♀️ Kartka win została dopełniona.",
            "🎉 Obudziłaś wewnętrzną Chylińską!<br>🎙️ NIE JEST ŹLEEEEE, JAAA JESTEM WINNAAAA",
        ]
    },
    broadway: {
        label: "Na Broadway",
        themeColor: "#eeb03c",
        stampSrc: "broadway.svg",
        messages: [
            "🎭 Broadway w formie!<br>Podesłać Ci formatkę wypowiedzenia?",
            "💃 Owacje na stojąco!<br>Nawet kierowca autobusu wstał i zaczął klaskać.",
        ]
    }
};

const state = {
    myFault: { stampCount: 0, totalCount: 0, currentMessage: "" },
    broadway: { stampCount: 0, totalCount: 0, currentMessage: "" }
};

let activeTab = "myFault";
let availableMessages = [...TABS[activeTab].messages];


// load state from Supabase
async function loadStateFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('kartawin_state')
            .select('myFault, broadway')
            .eq('id', 1)
            .single();

        if (error) throw error;
        if (data) {
            state.myFault = data.myFault;
            state.broadway = data.broadway;
        }
    } catch (error) {
        console.warn("Supabase load failed, using local state:", error);
    }
}

// save state to Supabase
async function saveStateToSupabase() {
    try {
        await supabase
            .from('kartawin_state')
            .update({
                myFault: state.myFault,
                broadway: state.broadway,
                updated_at: new Date().toISOString()
            })
            .eq('id', 1);
    } catch (error) {
        console.warn("Supabase save failed:", error);
    }
}

function getRandomCompletionMessage() {
    if (availableMessages.length === 0) {
        availableMessages = [...TABS[activeTab].messages];
    }
    const index = Math.floor(Math.random() * availableMessages.length);
    const msg = availableMessages[index];
    availableMessages.splice(index, 1);
    return msg;
}

document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

function hexToRgba(hex, alpha = 1) {
    if (!hex.startsWith('#')) return hex;
    let h = hex.slice(1);
    if (h.length === 3) h = [...h].map(c => c + c).join('') + 'ff';
    if (h.length === 6) h += 'ff';
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const a = (parseInt(h.slice(6, 8), 16) / 255) * alpha;
    return `rgba(${r}, ${g}, ${b}, ${Math.min(1, a)})`;
}

function switchTab(tabId) {
    activeTab = tabId;

    document.querySelectorAll(".tab").forEach(btn => {
        const id = btn.dataset.tab;
        btn.classList.toggle("active", id === tabId);
        if (id === tabId) {
            btn.style.backgroundColor = "";
            btn.style.borderColor = "";
            btn.style.color = "";
        } else {
            btn.style.backgroundColor = hexToRgba(TABS[id].themeColor, 0.25);
            btn.style.borderColor = hexToRgba(TABS[id].themeColor, 0.35);
            btn.style.color = "rgba(255,255,255,0.95)";
        }
    });

    document.documentElement.style.setProperty("--theme", TABS[tabId].themeColor);
    availableMessages = [...TABS[tabId].messages];
    render();
}

function render() {
    const { stampCount, totalCount, currentMessage } = state[activeTab];
    const { stampSrc } = TABS[activeTab];

    totalCounterEl.textContent = totalCount;
    message.innerHTML = currentMessage;

    stampSlots.forEach((slot, i) => {
        if (i < stampCount) {
            slot.classList.add("stamped");
            slot.innerHTML = `<div class="stamp-wrapper"><img src="${stampSrc}" class="stamp" /></div>`;
        } else {
            slot.classList.remove("stamped");
            slot.innerHTML = "";
        }
    });
}

function createStampSlots(count = 10) {
    card.innerHTML = "";
    for (let i = 0; i < count; i++) {
        const slot = document.createElement("div");
        slot.className = "stamp-slot";
        card.appendChild(slot);
    }
}

createStampSlots(10);
const stampSlots = document.querySelectorAll(".stamp-slot");

addStampBtn.addEventListener("click", () => {
    const tabState = state[activeTab];
    tabState.stampCount++;

    if (tabState.stampCount === 10) {
        tabState.totalCount++;
        tabState.currentMessage = getRandomCompletionMessage();
        addStampBtn.hidden = true;
        resetCardBtn.hidden = false;
    }

    render();
    saveStateToSupabase();
});

resetCardBtn.addEventListener("click", () => {
    const tabState = state[activeTab];
    tabState.stampCount = 0;
    tabState.currentMessage = "";
    addStampBtn.hidden = false;
    resetCardBtn.hidden = true;
    render();
    saveStateToSupabase();
});

// Load from Supabase, then initialize UI
(async () => {
    await loadStateFromSupabase();
    switchTab(activeTab);
})();

