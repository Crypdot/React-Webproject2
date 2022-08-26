# BlogSite
Ryhmä: Jarno Kaikkonen & Alexander San Miguel

## Projektikuvaus
Projektin tarkoitus oli luoda yksinkertainen blogi, jolle käyttäjät voivat lisätä haluamiaan kuvia. Tähän lisättiin nyt myös eri käyttäjien luonti, sekä niiden authorisointi. Kirjautumaton käyttäjä voi luoda tilin ja tarkastella kuvia sekä kommentteja, mutta ei pysty lisäämään näitä itse palvelimelle. Vasta kirjautunut käyttäjä voi tehdä molemmat. 

Olemme jakaneet palvelimet kahteen eri porttiin. simpleServer.js ja authServer.js 

### Rest kutsut simpleServer-palvelimelle 
simpleServer.js-käsittelee kuvien, sekä kommenttien lisäyksen palvelimelle.

#### POST /upload-file
Kutsua käytetään kun halutaan lähettää uusi kuva palvelimelle. Tällöin lähetetään sekä tiedosto, kuvalle oma otsake sekä kuvaus, että authorization-header, jolla tunnistetaan kuvan lähettäjä ja varmistetaan, että käyttäjällä on oikeus lisätä kuva palvelimelle. 

##### JSON-muoto
{
    dataFile: file,
    postTitle: title,
    postDescription: description
}

#### GET /images
Kutsu yksinkertaisesti hakee kaikki kuvat palvelimelta ja palauttaa JSON muodossa kuvan ID:n, linkin joka viittaa kuvan paikkaan palvelimella, otsakkeen ja kuvauksen.

#### GET /comments
Kutsua palauttaa halutun kuvan kaikki kommentit. Palvelimelle heitetään kuvan ID.

##### JSON-muoto
{
    postID: queryID
}

#### POST /add-comment (authenticateToken)
Kutsu lisää käyttäjän haluaman kommentin tietylle kuvalle. Samalla tavoin, tälle annetaan sekä kuvan ID, että itse kommenttitieto. Lisäksi tälle lähetetään kutsun otsakkeessa JSON webtoken, joka on tallennettu käyttäjän selaimen local-storageen. Näin varmistetaan, että käyttäjällä on lupa kommentoida, sekä saadaan selville käyttäjänimi, joka voidaan lisätä myös tietokantaan.

Tietokantaan tallentuu kommentin sisältö, aika jolloin se on tehty, sekä viittaus käyttäjän ID:n

##### JSON-muoto
headers: {Authorization: 'Bearer:'+tokenObj.accessToken} 

{
    postID: postID,
    commentdata: commentData
}

#### GET /fetch-image
Kutsua palauttaa halutun kuvan linkin palvelimelta, ilman mitään muuta ylimääräistä. Palvelimelle heitetään kuvan ID.

##### JSON-muoto
{
    postID: postID
}

### Rest kutsut authServer-palvelimelle 
authServer.js-käsittelee käyttäjien luomisen, sekä kirjautumisen palvelimelle.

#### POST /signup
Kutsu luo uuden käyttäjän, mikäli haluttua käyttäjänimeä tai sähköpostia ei löydy jo valmiiksi palvelimelta. Tälle annetaan kutsussa parametrit: käyttäjänimi, sähköposti ja salasana.  

##### JSON-muoto
{
    username: username,
    email: email,
    password: password
}

#### POST /login
Kutsu kirjaa käyttäjän sisään, mikäli käyttäjänimi löytyy palvelimelta, sekä annettu salasana täsmää oikein. Salasanaa ei tallenneta selkotekstinä palvelimella vaan käytetään bcryptiä suojaamaan tämä. Tälle annetaan kutsussa parametrit: käyttäjänimi ja salasana. Kirjauduttuaan sisään onnistuneesti, palvelin palauttaa JSON webtokenin, joka luodaan käyttäjänimen perusteella. Tämä tallennetaan käyttäjän selaimeen local storageen "myToken" nimikkeellä, joka menee umpeen puolen tunnin päästä.

##### JSON-muoto
{
    username: username,
    password: password
}
