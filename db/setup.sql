CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  director VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  genre VARCHAR(50),
  rating DECIMAL(3,1)
);

INSERT INTO movies (title, director, year, genre, rating)
SELECT 'Inception', 'Christopher Nolan', 2010, 'Sci-Fi', 8.8
WHERE NOT EXISTS (
  SELECT 1 FROM movies WHERE title = 'Inception' AND director = 'Christopher Nolan' AND year = 2010
);

INSERT INTO movies (title, director, year, genre, rating)
SELECT 'The Shawshank Redemption', 'Frank Darabont', 1994, 'Drama', 9.3
WHERE NOT EXISTS (
  SELECT 1 FROM movies WHERE title = 'The Shawshank Redemption' AND director = 'Frank Darabont' AND year = 1994
);

INSERT INTO movies (title, director, year, genre, rating)
SELECT 'Pulp Fiction', 'Quentin Tarantino', 1994, 'Crime', 8.9
WHERE NOT EXISTS (
  SELECT 1 FROM movies WHERE title = 'Pulp Fiction' AND director = 'Quentin Tarantino' AND year = 1994
);

INSERT INTO movies (title, director, year, genre, rating)
SELECT 'The Dark Knight', 'Christopher Nolan', 2008, 'Action', 9.0
WHERE NOT EXISTS (
  SELECT 1 FROM movies WHERE title = 'The Dark Knight' AND director = 'Christopher Nolan' AND year = 2008
);
