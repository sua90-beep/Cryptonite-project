class ToggleService {
    
    private readonly STORAGE_KEY = "selected_coins";

    // 1. שליפת רשימת ה-IDs שנשמרו מה-LocalStorage
    public getSelectedIds(): string[] {
        const data = localStorage.getItem(this.STORAGE_KEY);
        // אם אין נתונים, מחזירים מערך ריק
        return data ? JSON.parse(data) : [];
    }

    // 2. שמירת רשימת ה-IDs ל-LocalStorage
    private save(ids: string[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ids));
    }

    /**
     * פונקציית ה-Toggle המרכזית:
     * מקבלת ID של מטבע ומחליטה אם להוסיף, להסיר או לחסום (בגלל הגבלה).
     */
    public toggleCoin(coinId: string): { updatedIds: string[], limitReached: boolean } {
        let selected = this.getSelectedIds();

        // בדיקה: האם המטבע כבר קיים ברשימה?
        const isAlreadySelected = selected.includes(coinId);

        if (isAlreadySelected) {
            // אם הוא קיים - מסירים אותו (תמיד מותר להסיר)
            selected = selected.filter(id => id !== coinId);
            this.save(selected);
            return { updatedIds: selected, limitReached: false };
        }

        // אם הוא לא קיים - בודקים אם הגענו למגבלה של 5
        if (selected.length >= 5) {
            // מחזירים דגל שהגענו למגבלה בלי לעדכן את הרשימה
            return { updatedIds: selected, limitReached: true };
        }

        // אם יש מקום - מוסיפים את המטבע החדש
        selected.push(coinId);
        this.save(selected);
        return { updatedIds: selected, limitReached: false };
    }
}

// ייצוא מופע יחיד (Singleton) של הסרוויס
export const toggleService = new ToggleService();