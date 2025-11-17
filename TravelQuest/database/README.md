# Database Setup

In acest document este prezentat procesul de configurare si testare initiala a bazei de date pentru aplicatia noastra Web **Travel Quest**.

Baza de date este configurata local, folosind PostgreSQL ruland intr-un container Docker, pentru a asigura coerenta intre mediile de lucru ale tuturor membrilor echipei.

---

## Avantajele configurarii cu Docker:
- Toti membrii echipei folosesc aceeasi versiune PostgreSQL.
- Configuratia este in cod in fisierul: docker-compose.yml (nu necestita configurarea manuala).
- Este mai usor de pornit.
- Nu este necesara instalarea PostgreSQL.
- Baza de date este usor de resetat cu cateva comenzi:
  
  ```console
  docker compose down -v
  ```
  ```console
  docker compose up
- Usor de integrat cu backend-ul Spring Boot.

---

## Configurarea conexiunii in backend

- Am creat un fisier: docker-compose.yml
- Am comunicat datele de conectare necesare backend-ului (URL, credentiale, port) și acestea au fost incluse in configuratia "application.yml" de catre colega responsabila de backend.
- Am pornit baza de date in terminalul proiectului(CMD) folosind comanda:
  
  ```console
  docker-compose up -d
- Am testat baza de date intrand in PostgreSQL cu comanda:
  
  ```console 
  docker exec -it travelquest-postgres psql -U travelquest -d travelquest_dev

---

## Scheme & Date de test
In folder-ul ```database``` al proiectului am creat doua fisere noi:
  - ```schema.sql```: aici se creaza tabelele bazei de date a aplicatiei
  - ```data.sql```: contine insert-uri cu date de test pentru tabelele bazei de date

### Tabele create:
  - USER

---

## Ghid pentru configurarea setup-ului:

### Pasul 1:
- Instalezi si pornesti Docker Desktop
- Preiei fisierul: docker-compose.yml

### Pasul 2:
Deschizi proiectul in terminal, iar in folder-ul in care se afla fisierul: docker-compose.yml rulezi urmatoarele comenzi:

- **Pentru pornirea bazei de date si crearea container-ului**
  
  ```console
  docker-compose up -d
- **Pentru crearea tabelelor**

  ```console
  docker exec -i travelquest-postgres psql -U travelquest -d travelquest_dev < schema.sql
- **Pentru popularea tabelelor cu date de test**

  ```console
  docker exec -i travelquest-postgres psql -U travelquest -d travelquest_dev < data.sql
- **Pentru a intra in PostgreSQL**
  
  ```console
  docker exec -it travelquest-postgres psql -U travelquest -d travelquest_dev
- **Pentru a iesi din PostgreSQL**
  
  ```console
  \q 

### Pasul 3:
Verifica daca conexiunea se leaga corect:

- Deschide Docker Desktop si verifica daca a fost creat un container pentru baza de date a proiectului.
- Verifica daca dupa rularea comenzii de intrare in PostgreSQL vezi in terminal: ```travelquest_dev=#```.
- Foloseste comenzile utile din PostgreSQL pentru vizualizarea si verificarea datelor si a tabelelor.
- Fa operatii CRUD in PostgreSQL si vezi daca functioneaza corect.
- Testeaza intreg-ul proiect: Acceseaza pagina de register si creaza un nou utilizator in aplicatie, verifica apoi daca noile date au fost inregistrate corect in baza de date.

---

## Comenzi utile PostgreSQL:
- **Afiseaza toate tabelele**

  ```console
  \dt
- **Descrie structura unui tabel**

  ```console
  \d user
- **Structura + constrângeri detaliate ale unui tabel**

  ```console
  \d+ users
- **Operatii CRUD**
  - **Vezi toate datele dintr-un tabel**
  
    ```console
    \SELECT * FROM user;
  - **Vezi primele 10 randuri dintr-un tabel**
  
    ```console
    SELECT * FROM user LIMIT 10;
  - **Insert**
  
    ```console
    INSERT INTO USER (role, username, password_hash, phone_number, email, level, xp, travel_coins) VALUES
    ('ADMIN',   'UserTest', '$2a$10$dummyhashadmin',  '0744111111', 'user@test.com', 1, 0, 0);
  - **Update**
  
    ```console
    UPDATE user SET username = 'UpdatedUsername' WHERE user_id = 1;
  - **Delete**
  
    ```console
    DELETE FROM user WHERE user_id = 1;
- **Afiseaza informatii despre conexiune**

  ```console
  \conninfo 
- **Iesi din postgres**

  ```console
  \q
  
---