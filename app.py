import sqlite3
from flask import Flask, render_template, request, redirect, url_for, jsonify, flash

app = Flask(__name__)
app.secret_key = 'your secret key' # Necessary for flash messages

DATABASE = "student_data.db"

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # This allows accessing columns by name
    return conn

def create_table():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            math INTEGER,
            science INTEGER,
            english INTEGER
        )
    """)
    conn.commit()
    conn.close()

# Initialize the database and table when the app starts
create_table()

# --- Routes ---

@app.route('/')
def index():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students ORDER BY id")
    students = cursor.fetchall()
    conn.close()
    return render_template('index.html', students=students)

@app.route('/add', methods=['GET', 'POST'])
def add_student():
    if request.method == 'POST':
        name = request.form['name']
        math = request.form['math']
        science = request.form['science']
        english = request.form['english']

        conn = get_db()
        cursor = conn.cursor()
        try:
            cursor.execute("INSERT INTO students (name, math, science, english) VALUES (?, ?, ?, ?)",
                           (name, math, science, english))
            conn.commit()
            flash('Student added successfully!', 'success')
        except sqlite3.Error as e:
            flash(f'Error adding student: {e}', 'danger')
            print(f"Database error: {e}")
        finally:
            conn.close()
        return redirect(url_for('index'))
    return render_template('add_student.html')

@app.route('/edit/<int:student_id>', methods=['GET', 'POST'])
def edit_student(student_id):
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        name = request.form['name']
        math = request.form['math']
        science = request.form['science']
        english = request.form['english']

        try:
            cursor.execute("""
                UPDATE students
                SET name = ?, math = ?, science = ?, english = ?
                WHERE id = ?
            """, (name, math, science, english, student_id))
            conn.commit()
            flash('Student updated successfully!', 'success')
        except sqlite3.Error as e:
            flash(f'Error updating student: {e}', 'danger')
            print(f"Database error: {e}")
        finally:
            conn.close()
        return redirect(url_for('index'))

    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    student = cursor.fetchone()
    conn.close()
    if student is None:
        flash('Student not found!', 'danger')
        return redirect(url_for('index'))
    return render_template('edit_student.html', student=student)

@app.route('/delete/<int:student_id>', methods=['GET']) # Should be POST for safety, but GET is simpler for now
def delete_student(student_id):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM students WHERE id = ?", (student_id,))
        conn.commit()
        flash('Student deleted successfully!', 'success')
    except sqlite3.Error as e:
        flash(f'Error deleting student: {e}', 'danger')
        print(f"Database error: {e}")
    finally:
        conn.close()
    return redirect(url_for('index'))

# Note: The graph route /graph/<int:student_id> is not needed as per current index.html implementation.
# The data is passed directly to the JavaScript in index.html from the main student list.
# If we wanted to fetch it via AJAX, we would implement it like this:
# @app.route('/graph/<int:student_id>')
# def graph_data(student_id):
#     conn = get_db()
#     cursor = conn.cursor()
#     cursor.execute("SELECT math, science, english FROM students WHERE id = ?", (student_id,))
#     student_marks = cursor.fetchone()
#     conn.close()
#     if student_marks:
#         return jsonify(math=student_marks['math'], science=student_marks['science'], english=student_marks['english'])
#     return jsonify({}), 404


if __name__ == "__main__":
    app.run(debug=True)
