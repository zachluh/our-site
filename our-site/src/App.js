import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import {useEffect, useState, useRef } from 'react';
import './App.css';
import SpotifyEmbed from './SpotifyEmbed';

function App() {

  const [currentText, setCurrentText] = useState('');
  const [posts, setPosts] = useState([]);
  const [display, setDisplay] = useState('');
  const [spotifyInputVisible, setSpotifyInputVisible] = useState(false);
  const [pictureInputVisible, setPictureInputVisible] = useState(false);
  const [userInputVisible, setUserInputVisible] = useState(false);
  const [passwordInputVisible, setPasswordInputVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [filterChecklistVisisble, setFilterChecklistVisible] = useState(false);
  const currentUserRef = useRef(currentUser);

  const colors = {
    Zach : 'blue',
    Zayn : 'red'  
  };

  const [filters, setFilters] = useState({
    text : true,
    pictures : true,
    songs : true
  });

  useEffect(() => {
    fetch('https://our-site-production.up.railway.app/posts')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          data.reverse();
          createPosts(data);
          console.log("Data: " + data);
          setPosts(data);
          console.log("Postssss:" + posts);
        }
      })
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    currentUserRef.current = currentUser; 
  }, [currentUser]);

  const updateText = (e) => {
    setCurrentText(e.target.value);
  };

  const handleDropDownChange = (e) => {
    if (e.target.value === "song") {
      setSpotifyInputVisible(true);
      setPictureInputVisible(false);
    }

    if (e.target.value === "picture") {
      setPictureInputVisible(true);
      setSpotifyInputVisible(false);
    }
  }

  const handleFormSubmissions = (e) => {
    if (e.type === 'keydown') {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.target.name === 'songInput') {
            setPosts((prev) => {
  
              const songID = e.target.value.match(/track\/([^?]+)/);
              const newPosts = [{post_type:'song', post_content: songID[1], post_user: currentUser}, ...prev];
  
              createPosts(newPosts);
              updatePostDatabase('song', songID[1], currentUser);
              return newPosts;
              
            });
            setSpotifyInputVisible(false) 
  
          }
  
      }
    }

    else if (e.target.name === 'pictureInput') {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);

      fetch('https://our-site-production.up.railway.app/upload', {method:'POST', body:formData})
      .then((response) => response.json())
      .then((data) => {
        console.log('File uploaded successfully:', data);

        setPosts((prev) => {

          const imageURL = data.fileUrl;
          const newPosts = [{post_type:'picture', post_content: `https://our-site-production.up.railway.app${imageURL}`, post_user: currentUser}, ...prev];

          createPosts(newPosts);
          updatePostDatabase('picture', `https://our-site-production.up.railway.app${imageURL}`, currentUser);
          return newPosts;
          
        });
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
      });

      setPictureInputVisible(false);



      
    }
    

  }

  const handleLogin = (e) => {
    if (e.target.tagName.toLowerCase() === 'button') {
      setUserInputVisible(false);
      setPasswordInputVisible(true);
      setIsLoggedIn(true);

      if (e.target.name === 'zach') setCurrentUser('Zach');
      else setCurrentUser('Zayn');

      console.log(currentUser);
    }

    else {
      if (e.key === 'Enter') {
        e.preventDefault()

        const password = e.target.value;
        console.log(process.env);

        if (currentUser === 'Zach' && password === process.env.REACT_APP_ZACHPASSWORD) {
          console.log("yerp");
          setPasswordInputVisible(false);
        }
  
        else if (currentUser === 'Zayn' && password === process.env.REACT_APP_ZAYNPASSWORD) {
          setPasswordInputVisible(false);
        }

        console.log(currentUser);
      }
      
    }
  }



  const addTextPost = (e) => {
    if ( e.key === 'Enter' && currentText.trim() !== '') {
      e.preventDefault()

      setPosts((prev) => {
        const newPosts = [{post_type: 'text', post_content: currentText, post_user: currentUser}, ...prev];
        createPosts(newPosts);
        updatePostDatabase('text', currentText, currentUser);
        return newPosts;
      });

    }
  }

  const deletePost = async (e, key) => {
      setPosts((prev) => {

        const postIndex = prev.findIndex(post => post.id === key); 
        const post = prev[postIndex];


        if (post.post_user === currentUserRef.current) {
          const newPosts = prev.filter((_, index) => index !== postIndex);
          console.log("New Posts: " + newPosts);
          createPosts(newPosts);
          deletePostFromDatabase(key);
          return newPosts;
        }

        return prev;
      })


      
    


  }

  const deletePostFromDatabase = async (id) => {
    try {
      const response = await fetch(`https://our-site-production.up.railway.app/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json', 
        },
      });


      if (response.ok) {
        console.log("Post deleted successfully!");
      }

      else {
        const errorMessage = await response.json();
        console.log("Post failed to be deleted: " + errorMessage);
      }

    }

    catch (error) {
      console.log('Error deleting post.');
      console.error(error);
    }
  }


  const createPosts = (newPosts) => {

    if (!passwordInputVisible) {

    setDisplay(newPosts.map((post, index) => {
      const color = (post.post_user === 'Zach' ? colors.Zach : colors.Zayn);

      if (post.post_type === "song") {
        if (filters.songs) {
          return (
            <div className='container p-2 mt-5 w-100' style={{border:'2px black dashed', width:'auto'}}>
              <div className="d-flex justify-content-between align-items-center" > 
                <p className='mb-2' style={{color:color}}>{post.post_user}</p>
                <p key={index} style={{cursor: "default"}} onClick={(e) => deletePost(e, post.id)}>X</p> 
              </div>
              {SpotifyEmbed(post.post_content)}
            </div>          
          )
        }
      }

      else if (post.post_type === "picture") {
        if (filters.pictures) {
          return (
            <div className='container p-2 mt-5 w-100' style={{border:'2px black dashed', width:'5vw'}}>
              <div className="d-flex justify-content-between align-items-center"> 
                <p className='mb-2' style={{color:color}}>{post.post_user}</p>
                <p key={index} style={{cursor: "default"}} onClick={(e) => deletePost(e, post.id)}>X</p>
              </div>
              <img src={post.post_content} style={{ maxWidth: '100%', height: 'auto' }}/>
            </div>
          )
        }

      }

      else {
        if (filters.text) {
          return(
            <div className='container p-2 mt-5 w-100' style={{border:'2px black dashed', width:'20vw', wordWrap:'break-word', overflowWrap:'break-word'}}>
              <div className="d-flex justify-content-between align-items-center" > 
                <p className='mb-2' style={{color:color}}>{post.post_user}</p>
                <p key={index} style={{cursor: "default"}} onClick={(e) => deletePost(e, post.id)}>X</p>
              </div>
              <p>{post.post_content}</p>
            </div> 
          )
        }

      }

      
  }));

    }
  }

  const updatePostDatabase = async (type, content, user) => {
      try {
        const response = await fetch('https://our-site-production.up.railway.app/add-post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({type, content, user}),
        });

        const data = await response.json();

        if (response.status === 201) {
          console.log('Post successfully added to database');
        } else {
          console.log(`Error: ${data.message}`);
        }
      } catch (error) {
        console.log('Error: Could not connect to server');
        console.error('Error:', error);
      }
  }

  const handleSettingsChange = (e) => {
      if (e.target.value === "filterBy") {
        setFilterChecklistVisible(true);
      }

  }

  const handleFilterChange = (e) => {
      const changedFilter = e.target.value;
      if (changedFilter === 'filterText') setFilters((prev) =>  ({...prev, text: !prev.text}));
      else if (changedFilter === 'filterPictures') setFilters((prev) =>  ({...prev, pictures: !prev.pictures}));
      else if (changedFilter === 'filterSong') setFilters((prev) =>  ({...prev, songs: !prev.songs}));
      else if (changedFilter === 'filterDone') setFilterChecklistVisible(false);

      createPosts(posts);
  }

  return (

    <div className='d-flex flex-column min-vh-100' >
      {filterChecklistVisisble && (
      <div className="position-absolute top-50 start-50 translate-middle d-flex justify-content-center align-items-center" style={{
        zIndex: 10,
        backdropFilter: 'blur(8px)',
        width: '100%',
        height:'100%',
        position: 'absolute', 
        top: '50%', 
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.3)'
        }}>
          <div className='card' style={{width:'auto', height:'auto', border:'1px black dashed', borderRadius:'0'}}>
            <h1 className='card-title text-center m-2'>Filters</h1>
            <div className='card-body mt-3'>
              <div className="form-check m-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="checkbox1"
                  value='filterText'
                  checked={filters.text}
                  onChange={handleFilterChange}
                />
                <label className="form-check-label" htmlFor="checkbox1">
                  Text
                </label>
              </div>

              <div className="form-check m-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="checkbox2"
                  value='filterPictures'
                  checked={filters.pictures}
                  onChange={handleFilterChange}
                />
                <label className="form-check-label" htmlFor="checkbox2">
                  Pictures
                </label>
              </div>

              <div className="form-check m-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="checkbox3"
                  value='filterSong'
                  checked={filters.songs}
                  onChange={handleFilterChange}
                />
                <label className="form-check-label" htmlFor="checkbox3">
                  Songs
                </label>
              </div>
            </div>
            <div className="card-footer text-center">
              <button className="btn" value="filterDone" onClick={handleFilterChange}>Done</button>
            </div>
          </div>
        </div>
      )} 
      {!isLoggedIn && (
        <div className="position-absolute top-50 start-50 translate-middle d-flex justify-content-center align-items-center" style={{
          zIndex: 10,
          backdropFilter: 'blur(8px)',
          width: '100%',
          height:'100%',
          position: 'absolute', 
          top: '50%', 
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.3)'
          }}>
            <form name='userForm' className='card p-5' style={{width:'auto'}}>
              <p className='card-title pb-2 text-center'>Who are you?</p>
              <button className='form-control mb-1' name="zayn" onClick={handleLogin}>Zayn</button>
              <button className='form-control' name="zach" onClick={handleLogin}>Zach</button>
            </form>
            
        </div>
      )}

      {passwordInputVisible && (
        <div className="position-absolute top-50 start-50 translate-middle d-flex justify-content-center align-items-center" style={{
          zIndex: 10,
          backdropFilter: 'blur(8px)',
          width: '100%',
          height:'100%',
          position: 'absolute', 
          top: '50%', 
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.3)'
          }}>
            <form name='passwordForm' className='card p-5' onKeyDown={handleLogin} style={{width:'auto'}}>
              <p className='card-title pb-2'>Enter your password:</p>
              <input name='passwordInput' className='form-control' placeholder='Password...' style={{width:'100%', height:'5%'}}/>

            </form>
            
        </div>
      )}
      {spotifyInputVisible && (
        <div className="position-absolute top-50 start-50 translate-middle d-flex justify-content-center align-items-center" style={{
          zIndex: 10,
          backdropFilter: 'blur(8px)',
          width: '100%',
          height:'100%',
          position: 'absolute', 
          top: '50%', 
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.3)'
          }}>
            <form name='songForm' onKeyDown={handleFormSubmissions}>
              <input name='songInput' className='form-control' placeholder='Enter song URL...' style={{width:'auto', height:'10%'}}/>
            </form>
            
        </div>

        )

      }

      {
        pictureInputVisible && (
          <div className="position-absolute top-50 start-50 translate-middle d-flex justify-content-center align-items-center" style={{
            zIndex: 10,
            backdropFilter: 'blur(8px)',
            width: '100%',
            height:'100%',
            position: 'absolute', 
            top: '50%', 
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.3)'
            }}>
              <form name='pictureForm' onKeyDown={handleFormSubmissions}>
                <input onChange={handleFormSubmissions} type="file" name='pictureInput' className='form-control' placeholder='Choose picture' style={{width:'auto', height:'10%'}}/>
              </form>
              
          </div>
        )
      }
        
      {isLoggedIn && !passwordInputVisible &&(
        <>     
        <div className='m-5' style={{display: 'flex', justifyContent: 'space-between'}}>
          <select className='form-select' style={{width:'auto', border: '1px solid black'}} onChange={handleDropDownChange}>
            <option className='form-control' value="" selected disabled hidden>+</option>
            <option className='form-control'  value="song">Song</option>
            <option className='form-control' value="picture">Picture</option>
          </select>
          <button className='btn' value="filterBy" style={{width:'auto', border: '1px solid black'}} onClick={handleSettingsChange}>Filters</button>
          
        </div>
        <div style={{justifyContent:'center'}}>
          <div>
            {display}
          </div>
          <textarea onChange={updateText} onKeyDown={addTextPost} className='mt-auto position-fixed' style={{width:"100%", bottom:'0', left:'0'}}/>
        </div>
        </> 
      )};
      
    </div>
    

  );
}

export default App;
