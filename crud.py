import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

def attached_db():
    return sqlite3.connect("student_data.db")

def visualization():
    conn = attached_db()
    df = pd.read_sql("SELECT * FROM students", conn)
    conn.close()
    
    if df.empty:
        print("Data not Available")
        return 
    df = df.set_index("name")[['math', 'science', 'english']]
    df.plot(kind='bar', )
    plt.ylabel('marks')
    plt.title('student marks')
    plt.tight_layout()
    plt.show()

def create_table():
    conn = attached_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            math INTEGER,
            science INTEGER,
            english INTEGER
        )
    """)
    conn.commit()
    conn.close()

def create():
    try:
        id = int(input("Enter id: "))
        name = input("Enter name: ")
        math = int(input("Enter math: "))
        science = int(input("Enter science: "))
        english = int(input("Enter english: "))
        student = (id, name, math, science, english)
        
        conn = attached_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO students VALUES (?, ?, ?, ?, ?)", student)
        conn.commit()
        conn.close()
        
    except Exception as e:
        print("Error:", e)
        
def read():
    conn = attached_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students")
    rows = cursor.fetchall()
    conn.close()
    for row in rows:
        print(row)
    print()

def read_pd():
    conn = attached_db()
    try:
        df = pd.read_sql("SELECT * FROM students", conn)
        print(df)
    except Exception as e:
        print("Error reading with Pandas: ", e)
    conn.close()
    print()
    
def update():
    try:
        id = int(input("Enter id: "))
        math = int(input("Enter math: "))
        science = int(input("Enter science: "))
        english = int(input("Enter english: "))
        
        conn = attached_db()
        cursor = conn.cursor()
        cursor.execute("""
                       UPDATE students
                       SET math = ?, science = ?, english = ?
                       WHERE id = ?
                       """, (math, science, english, id))
        conn.commit()
        conn.close()
    except Exception as e:
        print("Error:", e)
        
def delete():
    try:
        id = int(input("Enter id: "))
        conn = attached_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM students WHERE id = ?", (id,))
        conn.commit()
        conn.close()
    except Exception as e:
        print("Error:", e)
        
def menu():
    create_table()
    while True:
        print("1. add students ")
        print("2. view students")
        print("3. update students")
        print("4. delete student")
        print("5. view with pandas")
        print("6. plotting")
        print("7. exit")
        
        choice = input("Enter your choice: ")
        
        if choice == '1':
            create()
        elif choice == '2':
            read()
        elif choice == '3':
            update()
        elif choice == '4':
            delete()
        elif choice == '5':
            read_pd()
        elif choice == '6':
            visualization()
        elif choice == '7':
            break
        else:
            print("Invalid choice.")
            
if __name__ == "__main__":
    menu()