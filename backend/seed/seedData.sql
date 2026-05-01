-- EXaMENES
INSERT INTO exams (title, description) VALUES
('Matematicas Basicas', 'Operaciones simples'),
('Cultura General', 'Preguntas variadas');

-- PREGUNTAS MATEMÁTICAS
INSERT INTO questions (exam_id, text) VALUES
(1, '¿Cuanto es 2 + 2?'),
(1, '¿Cuanto es 5 x 3?'),
(1, '¿Raíz cuadrada de 16?');

-- OPCIONES
INSERT INTO options (question_id, text, is_correct) VALUES
(1, '3', false),
(1, '4', true),
(1, '5', false),

(2, '15', true),
(2, '10', false),
(2, '20', false),

(3, '2', false),
(3, '4', true),
(3, '8', false);

-- CULTURA GENERAL
INSERT INTO questions (exam_id, text) VALUES
(2, 'Capital de Francia'),
(2, 'Planeta mas grande');

INSERT INTO options (question_id, text, is_correct) VALUES
(4, 'Madrid', false),
(4, 'París', true),
(4, 'Roma', false),

(5, 'Marte', false),
(5, 'Júpiter', true),
(5, 'Venus', false);