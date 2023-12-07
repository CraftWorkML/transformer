import * as React from 'react';
import { styled, useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

import { CardActionArea } from '@mui/material';

import IconButton from '@mui/material/IconButton';

import Skeleton from '@mui/material/Skeleton';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import { v4 as uuidv4 } from 'uuid';

import { Link, useLocation } from 'react-router-dom';
import {useDropzone} from 'react-dropzone';
import { GetLogout, craftImage, craftMessage, deleteFile, getFiles, postFile, getTracks, craftTrack, craftMelody } from './handlers';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
const drawerWidth = 240;

const btnTheme = createTheme({
  palette: {
    accept: {
      main: '#618833',
    },
    clear: {
      main: '#f50057',
    },
  },
});
const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
  };
  
  const focusedStyle = {
    borderColor: '#2196f3'
  };
  
  const acceptStyle = {
    borderColor: '#00e676'
  };
  
  const rejectStyle = {
    borderColor: '#ff1744'
  };

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(5),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    flexGrow: 1,
  }));

  function CardAudio({audio, id, onDelete}) {
    return (<Card sx={{ maxWidth: 250 }}>
                <CardActionArea>
                <AudioPlayer
                  src={audio}
                  volume={0.5}
                  customAdditionalControls={
                    [
                      id ? <IconButton >
                                  <CloseIcon fontSize='small' id={id} onClick={onDelete}/>
                                 </IconButton>:<></>,
                      
                    ]
                  }
                  // Try other props!
                /> 
                </CardActionArea>
                </Card>)
    
  };

  function CardAudioSkeleton() {
    return (<Card sx={{ maxWidth: 250}}>
      <CardActionArea>
        <Skeleton />
        <Skeleton height="100%" />
          
      </CardActionArea>
    </Card>)
    
  };

 function MasonryAudioList({itemData, handler}) {
  const [current, modifyThis] = React.useState("")
 
  const handleDeleteClick = async (e) => {
    //e.preventDefault();
    if ((e.target.tagName !== "svg") && (e.target.tagName !== "button")) {
      return;
    }
    console.log("try to delte ",e.target.tagName);
    const url = new URL(e.target.id);
    const username = url.pathname.split("/").slice(-2);
    await deleteFile({user:username[0], name: username[1]}).then(()=>
      {
        itemData=itemData.filter((it)=>{return it !== e.target.id});
        handler(username[0], true);
      }
      );
  }
    console.log("items=",itemData);
    return (
      
      <Box sx={{ width: "100%", height: 450, overflowY: 'scroll' }}>
        
        <Stack spacing={{ xs: 1, sm: 2 }} direction="column" useFlexGap flexWrap="wrap">
          {itemData.map((item) => (
            <Item key={item}>
              <CardAudio
                id={`${item}`}
                audio={`${item}`}
                onDelete={handleDeleteClick}
              />
            </Item>
          ))}
        </Stack>
      </Box>
    );
  }

  export default function Audio(props) {
    const [message, updateMessage] = React.useState("");
    const [paths, updatePaths] = React.useState([]);
    const [audios, fetchAudios] = React.useState([]);
    const [isProcessed, switchProc] = React.useState(false);
    const [isRefreshed, switchRefresh] = React.useState(false);
    const [audio, uploadAudio] = React.useState("");
    const [blob, uploadblob] = React.useState(null);
    const fetchData = React.useCallback(async (user, authorize)=> {
      if  (authorize) {
        console.log("1");
        let files = await getTracks({user: user});
        fetchAudios(files.response);
      }
    },[]);
    const handleClick = async () => {
      console.log("current message is ", message, "and path=",paths);
      switchProc(true);
      updateMessage("");
      if (paths.length === 0) {
      await craftTrack({message: message}).then(result => {
        //console.log("result os", result);
        if (!result.err) {

          let imageStr = result.response;
          uploadblob(result.blob);
          uploadAudio(imageStr);
          switchProc(false);
        }
      }).finally(()=>switchProc(false))
    } else {
      await craftMelody({message: message, file: paths[0]}).then(result => {
        //console.log("result os", result);
        if (!result.err) {

          let imageStr = result.response;
          uploadblob(result.blob);
          uploadAudio(imageStr);
          switchProc(false);
        }
      }).finally(()=>switchProc(false))
    }
    }
    const handleAcceptClick = async () => {
      let res = await postFile({file: blob, user: props.user, name: uuidv4()+".wav"}).then(
        fetchData(props.user, props.authorize)).then(
          uploadAudio("")).finally(() => {
            if (isRefreshed) {
              switchRefresh(false);
            } else {
              switchRefresh(true);
            }
            }
          );
        
      console.log("result is ", res);
    }
    const handleClearClick = () => {
      uploadAudio("");
    }
    React.useEffect(()=> {
      if (!props.authorize) {
        updateMessage("");
        updatePaths([]);
        switchProc(false);
        uploadAudio("");
      }
    },[props]);
    //
    React.useEffect( ()=> {
      fetchData(props.user, props.authorize);
      console.log("base");
    },[props, isRefreshed]);
    return (
      <Box sx={{ width: "80%" }}>
        <Stack spacing={{ xs: 1, sm: 2 }} direction="column" useFlexGap flexWrap="wrap">
          <Item>
            {props.authorize ? <div><Avatar alt={props.user} src={props.picture}/><h1>{"Greetings" + " "+ props.user}</h1></div>:<h1>Welcome to craft lab!</h1>} 
          </Item>
          <Item>
            <StyledDropzone handler={updatePaths} />
          </Item>
          <Item>
          <TextField sx={{ maxWidth: 600 }}
                     fullWidth={true}
                      id="standard-basic"
                      label="Message" 
                      variant="standard"
                      onChange={(event) => updateMessage(event.target.value)} 
                      multiline
                       /> 
          <Button variant="contained" onClick={handleClick}>Craft it</Button>

           </Item>
           <Item>
                {(isProcessed) ? <CardAudioSkeleton/> : <></>}
                {(!isProcessed && audio != "") ? <div><CardAudio audio={audio}/>
                <ThemeProvider theme={btnTheme}>
                  <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap>
                    <Button variant="contained" color='accept' onClick={handleAcceptClick}>Accept</Button>
                    <Button variant="contained" color='clear' onClick={handleClearClick}>Clear</Button>
                  </Stack>
                </ThemeProvider>
                </div> : <></>}
            </Item>
            <Item>
              <MasonryAudioList itemData={audios} handler={fetchData}/>
            </Item>
        </Stack>
      </Box>
    );
  }
  
  function StyledDropzone(props) {
    const [paths, setPaths] = React.useState([]);

    const onDrop = React.useCallback(acceptedFiles => {
      props.handler(acceptedFiles);
      setPaths(acceptedFiles.map(file => URL.createObjectURL(file)));
    }, [setPaths]);

    const removeAll = () => {
      setPaths([]);
      props.handler([]);
    }

    const {
      getRootProps,
      getInputProps,
      isFocused,
      isDragAccept,
      isDragReject
    } = useDropzone({accept: {'audio/*': []}, onDrop});  
    const style = React.useMemo(() => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {})
    }), [
      isFocused,
      isDragAccept,
      isDragReject
    ]);
  
    return (
      <div className="container">
        <div {...getRootProps({style})}>
          <input {...getInputProps()} />
          <p>Drag 'n' drop some files here, or click to select files</p>
        </div>
        {paths.map((path) =>( 
        <CardAudio audio={path}/>))
       }
       {paths.length > 0 && <button onClick={removeAll}>Remove All</button>}
      </div>
    );
  }

