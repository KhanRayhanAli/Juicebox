const {
  client,
  getAllUsers,
  createUser,
  updateUser,
  getAllPosts,
  getPostsByUser,
  getUserById,
  createPost,
  updatePost,
  createTags,
  addTagsToPost,
  getPostById,
  getPostsByTagName,
  
} = require("./index");

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
      DROP TABLE IF EXISTS post_tags;
      DROP TABLE IF EXISTS tags;
      DROP TABLE IF EXISTS posts;
      DROP TABLE IF EXISTS users;
    `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("Starting to build tables...");

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true
      );
      CREATE TABLE posts(
        id SERIAL PRIMARY KEY,
        "authorId" INTEGER REFERENCES users(id) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
      );
      CREATE TABLE tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
      CREATE TABLE post_tags (
        "postId" INTEGER REFERENCES posts(id),
        "tagId" INTEGER REFERENCES tags(id),
        UNIQUE ("postId", "tagId")
      )
      `);

    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");
    throw error;
  }
}

async function createInitialUsers() {
  try {
    console.log("Starting to create users...");

    const albert = await createUser({
      username: "albert",
      password: "bertie99",
      name: "Albert",
      location: "Hong Kong, China",
    });
    const sandra = await createUser({
      username: "sandra",
      password: "2sandy4me",
      name: "Sandra",
      location:
        "Beverly Hills, California, USA (where the beaches are too sandy for her)",
    });
    const glamgal = await createUser({
      username: "glamgal",
      password: "soglam",
      name: "Gina",
      location: "New York City, New York, USA",
    });

    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

async function createInitialPosts() {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();

    await createPost({
      authorId: albert.id,
      title: "First Post",
      content: "This is my first post. It is short.",
      tags: ["#happy", "#youcandoanything"]
    });

    await createPost({
      authorId: glamgal.id,
      title: "First Post",
      content: "This is my first post. It is also short.",
      tags: ["#happy", "#worst-day-ever"]
    });

    await createPost({
      authorId: sandra.id,
      title: "NOT Sandra Bullock",
      content: "I am NOT Sandra Bullock. Don't EVER call me Sandra Bullock",
      tags: ["#NOTsandraBULLOCK", "DontEver"]
    });
    console.log("Posts have been created!");
  } catch (error) {
    console.log("Error creating post!");
    throw error;
  }
} 

async function createInitialTags() {
  try{
    console.log("Starting to create tags...");

    const [happy, sad, lonely, nSB, BF] = await createTags([
      '#so-happy',
      '#im-literally-crying-rn',
      '#i-dont-need-friends-they-disappoint-me',
      '#not-Sandra-Bullock',
      '#imgonnascreamifonemorepersoncallsmeSandraBullock'
    ]);
    
    const [postOne, postTwo, postThree] = await getAllPosts();
    
    await addTagsToPost(postOne.id, [happy, sad]);
    await addTagsToPost(postTwo.id, [sad, lonely]);
    await addTagsToPost(postThree.id, [sad, nSB, BF]);

    console.log("Tags created!")
  } catch (error) {
    console.log("Oops, no tags!")
    throw error;
  }
}



async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialPosts();
    await createInitialTags();
  } catch (error) {
    console.log("Error during rebuildDB");
    throw error;
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");

    console.log('Calling getAllUsers"');
    const users = await getAllUsers();
    console.log("Result:", users);

    console.log("Calling updateUser on users[0]");
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY",
    });
    console.log("Result:", updateUserResult);

    console.log("Running getAllPosts");
    const posts = await getAllPosts();
    console.log("Result:", posts[0].tags);

    console.log("Calling getPostsByTagName with #so-happy");
    const postsWithHappy = await getPostsByTagName("#so-happy")
    console.log("Result:", postsWithHappy)
    // console.log("Calling updatePost on posts[0]");
    // const updatePostResult = await updatePost(posts[0].id, {
    //   title: "New Title",
    //   content: "Updated Content",
    // });
    // console.log("Result:", updatePostResult);

    console.log("Calling updatePost on posts[3], only updating tags"); 
    const updatePostTagsResult = await updatePost(posts[1].id, {
    tags: ["#NOTtheBullock", "#justsandra", "#Hashbrown"]  
    });
    console.log("Result:", updatePostTagsResult);

    console.log("Calling getUserById with 1");
    const albert = await getUserById(1);
    console.log("Result:", albert);

    console.log("Finished database tests!");
  } catch (error) {
    console.error("Error testing database!");
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
