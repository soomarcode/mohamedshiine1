import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let realSupabase = null;
let useMock = false;

// ----------------------------------------------------
// Mock Data definitions
// ----------------------------------------------------
const initialCourses = [
    {
        id: 1,
        title: "Digital Product & AI Fundamentals",
        price: 0,
        pricelabel: "FREE",
        description: "Baro sida loo abuuro wax soo saar digital ah iyo sida loo adeegsado AI si aad u bilowdo ganacsi guuleysta.",
        image: "/images/course-product.png",
        buttontext: "Daawo Bilaash",
        type: "free",
        youtube_id: "dQw4w9WgXcQ"
    },
    {
        id: 2,
        title: "Mastering E-Commerce & Dropshipping",
        price: 49,
        pricelabel: "$49",
        description: "Ganacsiga E-commerce ka bilow eber iloo heer sare. Sida loo helo badeecadaha Soomaaliya, dhisida Shopify store, iyo xayaysiinta.",
        image: "/images/course-ecommerce.png",
        buttontext: "Ku Biir Hadda",
        type: "paid",
        youtube_id: "dQw4w9WgXcQ"
    },
    {
        id: 3,
        title: "WhatsApp Marketing & Sales Automation",
        price: 29,
        pricelabel: "$29",
        description: "Baro sirta suuq-geynta WhatsApp-ka iyo sida loo abuuro chatbot kaaga shaqeeya 24/7 si aad u kordhiso iibkaaga iyo macaamiishaada.",
        image: "/images/course-whatsapp.png",
        buttontext: "Ku Biir Hadda",
        type: "paid",
        youtube_id: "dQw4w9WgXcQ"
    }
];

const initialLessons = [
    // Course 1
    {
        id: 101,
        course_id: 1,
        title: "Casharka 1aad: Hordhaca Digital Products",
        duration: "12:15",
        youtube_id: "dQw4w9WgXcQ",
        pdf_link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        resource_link: "https://google.com",
        order_index: 1
    },
    {
        id: 102,
        course_id: 1,
        title: "Casharka 2aad: Sida loo isticmaalo ChatGPT & AI",
        duration: "15:30",
        youtube_id: "dQw4w9WgXcQ",
        pdf_link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        resource_link: "https://chat.openai.com",
        order_index: 2
    },
    {
        id: 103,
        course_id: 1,
        title: "Casharka 3aad: Diyaarinta Alaabta Digital-ka ah",
        duration: "18:45",
        youtube_id: "dQw4w9WgXcQ",
        pdf_link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        resource_link: "https://canva.com",
        order_index: 3
    },
    {
        id: 104,
        course_id: 1,
        title: "Casharka 4aad: Tijaabinta iyo Bilaabista Ganacsiga",
        duration: "20:10",
        youtube_id: "dQw4w9WgXcQ",
        pdf_link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        resource_link: "https://gumroad.com",
        order_index: 4
    },
    
    // Course 2
    {
        id: 201,
        course_id: 2,
        title: "Casharka 1aad: Fikradaha E-commerce-ka Soomaaliya",
        duration: "14:20",
        youtube_id: "dQw4w9WgXcQ",
        pdf_link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        resource_link: "https://google.com",
        order_index: 1
    },
    {
        id: 202,
        course_id: 2,
        title: "Casharka 2aad: Sida loo doorto Badeecad Guuleysata",
        duration: "22:15",
        youtube_id: "dQw4w9WgXcQ",
        pdf_link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        resource_link: "https://aliexpress.com",
        order_index: 2
    },
    {
        id: 203,
        course_id: 2,
        title: "Casharka 3aad: Dhisida Shopify Store Bilic leh",
        duration: "35:40",
        youtube_id: "dQw4w9WgXcQ",
        pdf_link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        resource_link: "https://shopify.com",
        order_index: 3
    },

    // Course 3
    {
        id: 301,
        course_id: 3,
        title: "Casharka 1aad: Waa maxay WhatsApp Business API?",
        duration: "10:50",
        youtube_id: "dQw4w9WgXcQ",
        pdf_link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        resource_link: "https://facebook.com",
        order_index: 1
    },
    {
        id: 302,
        course_id: 3,
        title: "Casharka 2aad: Sida loo abuuro Chatbot Bilaash ah",
        duration: "18:30",
        youtube_id: "dQw4w9WgXcQ",
        pdf_link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        resource_link: "https://manychat.com",
        order_index: 2
    }
];

const initialQuizzes = [
    // Course 1
    {
        id: 401,
        course_id: 1,
        question: "Waa maxay faa'iidada ugu weyn ee Digital Products?",
        options: ["Ma dhamaanayaan waligood oo mar walba waa la iibin karaa", "Waxay u baahan yihiin gaadiid raritaan (shipping)", "Waa kuwo qaali ah in la soo saaro mar kasta", "Dukaamo jireed oo waaweyn ayaa loo baahan yahay"],
        correct_answer: 0
    },
    {
        id: 402,
        course_id: 1,
        question: "Maxaa loo isticmaalaa ChatGPT marka la dhisayo ganacsi cusub?",
        options: ["Qorista fikradaha iyo maqaalada suuqgeynta", "Dhisida qaabka software-ka", "Kordhinta suuq-geynta qoraalka ee macaamiisha", "Dhammaan kuwa kor ku xusan"],
        correct_answer: 3
    },
    
    // Course 2
    {
        id: 501,
        course_id: 2,
        question: "Waa maxay Dropshipping?",
        options: ["Iibinta alaab aadan adigu kaydin oo shirkad kale kuu hayso", "Iibinta alaabta aad dukaankaaga ku kaydisay", "U rarida alaabta diyaarad ama markab", "Bixinta alaabo bilaash ah si loo xayaysiiyo"],
        correct_answer: 0
    },

    // Course 3
    {
        id: 601,
        course_id: 3,
        question: "Sidee WhatsApp Chatbot u caawiyaa ganacsigaaga?",
        options: ["Wuxuu macaamiisha u jawaabaa 24/7 xilli kasta", "Wuxuu xiraa iibka isagoo adiga kuu maqan", "Wuxuu si toos ah u kaydiyaa macluumaadka macaamiisha", "Dhammaan kuwa kor ku xusan"],
        correct_answer: 3
    }
];

const initialCertificates = [
    {
        id: 1,
        course_id: 1,
        template_url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1000",
        signature_url: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png"
    },
    {
        id: 2,
        course_id: 2,
        template_url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1000",
        signature_url: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png"
    },
    {
        id: 3,
        course_id: 3,
        template_url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1000",
        signature_url: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png"
    }
];

const initialReviews = [
    {
        id: 1,
        course_id: 1,
        user_name: "Abdi Rahman",
        user_avatar: "https://ui-avatars.com/api/?name=Abdi+Rahman&background=15803d&color=fff",
        rating: 5,
        comment: "Koorsadan aad bay ii caawisay! AI fundamentals aad ayaan u fahmay hadda.",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 2,
        course_id: 1,
        user_name: "Fadumo Ali",
        user_avatar: "https://ui-avatars.com/api/?name=Fadumo+Ali&background=15803d&color=fff",
        rating: 5,
        comment: "Casharadu waa kuwo aad u cad oo qof walba fahmi karo. Waad mahadsantihiin!",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 3,
        course_id: 2,
        user_name: "Guled Ahmed",
        user_avatar: "https://ui-avatars.com/api/?name=Guled+Ahmed&background=15803d&color=fff",
        rating: 5,
        comment: "Casharka Shopify store-ka wuxuu ahaa mid heersare ah. Ganacsigaygii ugu horeeyay ayaan bilaabay!",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
];

// Helper to load tables persistently
const loadTable = (tableName, initialData) => {
    if (typeof localStorage === 'undefined') return initialData;
    const saved = localStorage.getItem(`mock_db_${tableName}`);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error(`Error parsing mock table ${tableName}:`, e);
        }
    }
    localStorage.setItem(`mock_db_${tableName}`, JSON.stringify(initialData));
    return initialData;
};

const mockDbState = {
    courses: loadTable('courses', initialCourses),
    lessons: loadTable('lessons', initialLessons),
    quizzes: loadTable('quizzes', initialQuizzes),
    certificates: loadTable('certificates', initialCertificates),
    course_reviews: loadTable('course_reviews', initialReviews)
};

// ----------------------------------------------------
// Mock Database Query Builder
// ----------------------------------------------------
class MockQueryBuilder {
    constructor(tableName, data = [], mockDbInstance = null) {
        this.tableName = tableName;
        this.data = [...data];
        this.mockDb = mockDbInstance;
        this.filters = [];
        this.sortField = null;
        this.sortAscending = true;
        this.isSingle = false;
    }

    select(columns) {
        return this;
    }

    eq(field, value) {
        this.filters.push((item) => item[field] == value);
        return this;
    }

    order(field, { ascending = true } = {}) {
        this.sortField = field;
        this.sortAscending = ascending;
        return this;
    }

    single() {
        this.isSingle = true;
        return this;
    }

    execute() {
        let result = this.data;
        // Apply filters
        for (const filterFn of this.filters) {
            result = result.filter(filterFn);
        }
        // Apply sorting
        if (this.sortField) {
            result.sort((a, b) => {
                const valA = a[this.sortField];
                const valB = b[this.sortField];
                if (valA < valB) return this.sortAscending ? -1 : 1;
                if (valA > valB) return this.sortAscending ? 1 : -1;
                return 0;
            });
        }
        if (this.isSingle) {
            return { data: result[0] || null, error: result[0] ? null : { message: 'Row not found', status: 404 } };
        }
        return { data: result, error: null };
    }

    then(onfulfilled, onrejected) {
        return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
    }

    async insert(records) {
        const arr = Array.isArray(records) ? records : [records];
        const newRecords = arr.map((rec, i) => {
            const newRec = {
                id: Date.now() + i,
                created_at: new Date().toISOString(),
                ...rec
            };
            this.data.push(newRec);
            return newRec;
        });
        if (this.mockDb) {
            this.mockDb.saveTable(this.tableName, this.data);
        }
        return { data: newRecords, error: null };
    }

    async update(record) {
        let result = this.data;
        for (const filterFn of this.filters) {
            result = result.filter(filterFn);
        }
        result.forEach(item => {
            Object.assign(item, record);
        });
        if (this.mockDb) {
            this.mockDb.saveTable(this.tableName, this.data);
        }
        return { data: result, error: null };
    }

    async delete() {
        let result = this.data;
        for (const filterFn of this.filters) {
            result = result.filter(filterFn);
        }
        const idsToDelete = new Set(result.map(r => r.id));
        const remaining = this.data.filter(r => !idsToDelete.has(r.id));
        this.data = remaining;
        if (this.mockDb) {
            this.mockDb.saveTable(this.tableName, remaining);
        }
        return { data: result, error: null };
    }
}

const mockDb = {
    saveTable(tableName, data) {
        mockDbState[tableName] = data;
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(`mock_db_${tableName}`, JSON.stringify(data));
        }
    },
    from(table) {
        const data = mockDbState[table] || [];
        return new MockQueryBuilder(table, data, mockDb);
    }
};

// ----------------------------------------------------
// Mock Auth definitions
// ----------------------------------------------------
const authListeners = new Set();
let mockSession = null;

try {
    if (typeof localStorage !== 'undefined') {
        const savedSession = localStorage.getItem('mock_supabase_session');
        if (savedSession) {
            mockSession = JSON.parse(savedSession);
        }
    }
} catch (e) {
    console.error('Error loading mock session:', e);
}

const triggerAuthEvent = (event, session) => {
    for (const listener of authListeners) {
        try {
            listener(event, session);
        } catch (e) {
            console.error('Error in auth listener:', e);
        }
    }
};

const mockAuth = {
    async getSession() {
        return { data: { session: mockSession }, error: null };
    },
    async getUser() {
        return { data: { user: mockSession?.user || null }, error: null };
    },
    onAuthStateChange(callback) {
        authListeners.add(callback);
        setTimeout(() => {
            try {
                callback(mockSession ? 'SIGNED_IN' : 'SIGNED_OUT', mockSession);
            } catch (e) {
                console.error(e);
            }
        }, 0);
        return {
            data: {
                subscription: {
                    unsubscribe() {
                        authListeners.delete(callback);
                    }
                }
            }
        };
    },
    async signUp({ email, password, options }) {
        const user = {
            id: 'mock-user-id-' + Math.random().toString(36).substr(2, 9),
            email,
            user_metadata: options?.data || {},
            role: email === 'soomarcode@gmail.com' ? 'admin' : 'authenticated'
        };
        mockSession = {
            access_token: 'mock-token-' + Math.random().toString(36).substr(2, 9),
            user
        };
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('mock_supabase_session', JSON.stringify(mockSession));
        }
        triggerAuthEvent('SIGNED_IN', mockSession);
        return { data: { user, session: mockSession }, error: null };
    },
    async signInWithPassword({ email, password }) {
        const user = {
            id: 'mock-user-id-' + Math.random().toString(36).substr(2, 9),
            email,
            user_metadata: {
                full_name: email.split('@')[0],
                avatar_url: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=15803d&color=fff`,
                role: email === 'soomarcode@gmail.com' ? 'admin' : 'authenticated'
            },
            role: email === 'soomarcode@gmail.com' ? 'admin' : 'authenticated'
        };
        mockSession = {
            access_token: 'mock-token-' + Math.random().toString(36).substr(2, 9),
            user
        };
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('mock_supabase_session', JSON.stringify(mockSession));
        }
        triggerAuthEvent('SIGNED_IN', mockSession);
        return { data: { user, session: mockSession }, error: null };
    },
    async signOut() {
        mockSession = null;
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('mock_supabase_session');
        }
        triggerAuthEvent('SIGNED_OUT', null);
        return { error: null };
    }
};

// ----------------------------------------------------
// Mock Storage definitions
// ----------------------------------------------------
const mockStorage = {
    from(bucket) {
        return {
            async upload(path, file) {
                const mockUrl = URL.createObjectURL(file);
                return { data: { path, url: mockUrl }, error: null };
            },
            getPublicUrl(path) {
                return { data: { publicUrl: path.startsWith('http') ? path : `https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1000` } };
            }
        };
    }
};

// ----------------------------------------------------
// Cloudflare / Pause Error detection & display
// ----------------------------------------------------
const isNetworkError = (error) => {
    if (!error) return false;
    const msg = String(error.message || error).toLowerCase();
    const status = error.status || error.code;
    return (
        msg.includes('failed to fetch') ||
        msg.includes('networkerror') ||
        msg.includes('521') ||
        msg.includes('cloudflare') ||
        msg.includes('web server is down') ||
        status === '521' ||
        status === 521 ||
        msg.includes('cors') ||
        msg.includes('typeerror') ||
        msg.includes('load failed') ||
        msg.includes('unexpected token')
    );
};

const showMockModeToast = () => {
    if (typeof document === 'undefined') return;
    const existing = document.getElementById('supabase-mock-toast');
    if (existing) return;

    const toast = document.createElement('div');
    toast.id = 'supabase-mock-toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: rgba(30, 41, 59, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        color: #f8fafc;
        padding: 12px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 99999;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateY(100px);
        opacity: 0;
    `;
    
    toast.innerHTML = `
        <span style="font-size: 18px;">⚡</span>
        <div>
            <div style="font-weight: 600;">Mock Mode Active</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Supabase is offline/paused. Data is persisted locally.</div>
        </div>
        <button id="close-mock-toast" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 16px; margin-left: 10px; padding: 0;">✕</button>
    `;

    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 100);

    const closeBtn = toast.querySelector('#close-mock-toast');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            toast.style.transform = 'translateY(100px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        });
    }

    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.transform = 'translateY(100px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }
    }, 8000);
};

const activateMockMode = (reason) => {
    if (useMock) return;
    useMock = true;
    console.warn(`Supabase intelligent local mock mode activated. Reason:`, reason);
    if (typeof window !== 'undefined') {
        window.__supabaseMockActive = true;
    }
    showMockModeToast();
};

// ----------------------------------------------------
// Supabase Client Wrapper
// ----------------------------------------------------
let supabase;

try {
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_SUPABASE_URL')) {
        const msg = 'Supabase URL or Key is missing. Check your .env file or Vercel Environment Variables!';
        console.error(msg);
        activateMockMode('Credentials missing');
    } else {
        realSupabase = createClient(supabaseUrl, supabaseKey);
    }
} catch (error) {
    console.error('Supabase initialization failed:', error);
    activateMockMode(error);
}

// Helper to trap chainable PostgrestQueryBuilder calls and dynamically execute mock database if real query fails
function wrapQueryBuilder(table, realBuilder, methodChain = []) {
    return new Proxy(realBuilder, {
        get(target, prop, receiver) {
            if (prop === 'then') {
                return (onfulfilled, onrejected) => {
                    return target.then(
                        (result) => {
                            if (result && result.error && isNetworkError(result.error)) {
                                activateMockMode('db query error');
                                let mockBuilder = mockDb.from(table);
                                for (const step of methodChain) {
                                    mockBuilder = mockBuilder[step.prop](...step.args);
                                }
                                return mockBuilder.then(onfulfilled, onrejected);
                            }
                            return onfulfilled ? onfulfilled(result) : result;
                        },
                        (err) => {
                            activateMockMode(err);
                            let mockBuilder = mockDb.from(table);
                            for (const step of methodChain) {
                                mockBuilder = mockBuilder[step.prop](...step.args);
                            }
                            return mockBuilder.then(onfulfilled, onrejected);
                        }
                    );
                };
            }

            const value = Reflect.get(target, prop, receiver);
            if (typeof value === 'function') {
                return (...args) => {
                    const nextBuilder = value.apply(target, args);
                    return wrapQueryBuilder(table, nextBuilder, [...methodChain, { prop, args }]);
                };
            }
            return value;
        }
    });
}

supabase = {
    auth: {
        async getSession() {
            if (useMock) return mockAuth.getSession();
            try {
                const res = await realSupabase.auth.getSession();
                if (res.error && isNetworkError(res.error)) {
                    activateMockMode('getSession failed');
                    return mockAuth.getSession();
                }
                return res;
            } catch (err) {
                activateMockMode(err);
                return mockAuth.getSession();
            }
        },
        onAuthStateChange(callback) {
            mockAuth.onAuthStateChange(callback);
            if (!useMock && realSupabase) {
                try {
                    return realSupabase.auth.onAuthStateChange(callback);
                } catch (err) {
                    activateMockMode(err);
                }
            }
            return { data: { subscription: { unsubscribe: () => {} } } };
        },
        async getUser() {
            if (useMock) return mockAuth.getUser();
            try {
                const res = await realSupabase.auth.getUser();
                if (res.error && isNetworkError(res.error)) {
                    activateMockMode('getUser failed');
                    return mockAuth.getUser();
                }
                return res;
            } catch (err) {
                activateMockMode(err);
                return mockAuth.getUser();
            }
        },
        async signUp(credentials) {
            if (useMock) return mockAuth.signUp(credentials);
            try {
                const res = await realSupabase.auth.signUp(credentials);
                if (res.error && isNetworkError(res.error)) {
                    activateMockMode('signUp failed');
                    return mockAuth.signUp(credentials);
                }
                return res;
            } catch (err) {
                activateMockMode(err);
                return mockAuth.signUp(credentials);
            }
        },
        async signInWithPassword(credentials) {
            if (useMock) return mockAuth.signInWithPassword(credentials);
            try {
                const res = await realSupabase.auth.signInWithPassword(credentials);
                if (res.error && isNetworkError(res.error)) {
                    activateMockMode('signInWithPassword failed');
                    return mockAuth.signInWithPassword(credentials);
                }
                return res;
            } catch (err) {
                activateMockMode(err);
                return mockAuth.signInWithPassword(credentials);
            }
        },
        async signOut() {
            if (useMock) return mockAuth.signOut();
            try {
                const res = await realSupabase.auth.signOut();
                return res;
            } catch (err) {
                activateMockMode(err);
                return mockAuth.signOut();
            }
        }
    },

    from(table) {
        if (useMock || !realSupabase) {
            return mockDb.from(table);
        }
        try {
            const realBuilder = realSupabase.from(table);
            return wrapQueryBuilder(table, realBuilder);
        } catch (err) {
            activateMockMode(err);
            return mockDb.from(table);
        }
    },

    get storage() {
        if (useMock || !realSupabase) {
            return mockStorage;
        }
        return {
            from(bucket) {
                try {
                    const realBucket = realSupabase.storage.from(bucket);
                    return {
                        async upload(path, file) {
                            try {
                                const res = await realBucket.upload(path, file);
                                if (res.error && isNetworkError(res.error)) {
                                    activateMockMode('storage upload failed');
                                    return mockStorage.from(bucket).upload(path, file);
                                }
                                return res;
                            } catch (err) {
                                activateMockMode(err);
                                return mockStorage.from(bucket).upload(path, file);
                            }
                        },
                        getPublicUrl(path) {
                            try {
                                return realBucket.getPublicUrl(path);
                            } catch (err) {
                                activateMockMode(err);
                                return mockStorage.from(bucket).getPublicUrl(path);
                            }
                        }
                    };
                } catch (err) {
                    activateMockMode(err);
                    return mockStorage.from(bucket);
                }
            }
        };
    }
};

// Proactively check if Supabase is reachable to enable mock fallback early
if (realSupabase) {
    (async () => {
        try {
            const { error } = await realSupabase.from('courses').select('id').limit(1);
            if (error && isNetworkError(error)) {
                activateMockMode('Proactive check failed');
            }
        } catch (e) {
            activateMockMode(e);
        }
    })();
}

export { supabase };
