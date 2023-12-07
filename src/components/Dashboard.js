import * as React from 'react';
import { styled, useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import CloseIcon from '@mui/icons-material/Close';
import { v4 as uuidv4 } from 'uuid';
import Audio from './Audio';
import TS from './TS';

import { Link, useLocation } from 'react-router-dom';
import {useDropzone} from 'react-dropzone';
import { GetLogout, craftImage, craftMessage, deleteFile, getFiles, postFile } from './handlers';
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

  function CardImage({image}) {
    return (<Card sx={{ maxWidth: 345 }}>
                <CardActionArea>
                    <CardMedia
                        component="img"
                        height="255"
                        image={image}
                        alt="green iguana"
                    />    
                </CardActionArea>
                </Card>)
    
  };

  function CardImageSkeleton() {
    return (<Card sx={{ maxWidth: 345, height: 255 }}>
      <CardActionArea>
        <Skeleton />
        <Skeleton height="100%" />
          
      </CardActionArea>
    </Card>)
    
  };

 function MasonryImageList({itemData, handler}) {
  const [current, modifyThis] = React.useState("")
  const ref = React.useRef(null);
 
  const handleClick = async (e) => {
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

  const pic = "pic";
  console.log("items=",itemData);
    return (
      
      <Box sx={{ width: "100%", height: 450, overflowY: 'scroll' }}>
        
        <ImageList variant="masonry" cols={3} gap={8}>
          {itemData.map((item) => (
            <ImageListItem key={item}>
              <img
                srcSet={`${item}`}
                src={`${item}`}
                alt={pic}
                loading="lazy"
              />
            <IconButton ref={ref} >
              <CloseIcon fontSize='small' id={item} onClick={handleClick}/>
            </IconButton>
            </ImageListItem>
          ))}
        </ImageList>
      </Box>
    );
  }

  function formImageName(message, ext=".png") {
    let res = message.replaceAll(
              " ", "_").replaceAll(
              "/", "%").replaceAll(
              ",", "&").replaceAll(
              '"', "@@").replaceAll(  
              "'", "@").replaceAll(
              "/n", "_").replaceAll(
              "/t", "_");
    return res+ext;
  }

  function Content(props) {
    const [message, updateMessage] = React.useState("");
    const [paths, updatePaths] = React.useState([]);
    const [images, fetchImages] = React.useState([]);
    const [isProcessed, switchProc] = React.useState(false);
    const [isRefreshed, switchRefresh] = React.useState(false);
    const [image, uploadImage] = React.useState("");
    const [blob, uploadblob] = React.useState(null);
    const uid = React.useId();
    const fetchData = React.useCallback(async (user, authorize)=> {
      if  (authorize) {
        console.log("1");
        let files = await getFiles({user: user});
        fetchImages(files.response);
      }
    },[]);
    const handleClick = async () => {
      console.log("current message is ", message, "and path=",paths);
      switchProc(true);
      updateMessage("");
      if (paths.length === 0) {
      await craftMessage({message: message}).then(result => {
        //console.log("result os", result);
        if (!result.err) {

          let imageStr = result.response;
          uploadblob(result.blob);
          uploadImage(imageStr);
          switchProc(false);
        }
      }).finally(()=>switchProc(false))
    } else {
      await craftImage({message: message, file: paths[0]}).then(result => {
        //console.log("result os", result);
        if (!result.err) {

          let imageStr = result.response;
          uploadblob(result.blob);
          uploadImage(imageStr);
          switchProc(false);
        }
      }).finally(()=>switchProc(false))
    }
    }
    const handleAcceptClick = async () => {
      let res = await postFile({file: blob, user: props.user, name: uuidv4()+".png"}).then(
        fetchData(props.user, props.authorize)).then(
          uploadImage("")).finally(() => {
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
      uploadImage("");
    }
    React.useEffect(()=> {
      if (!props.authorize) {
        updateMessage("");
        updatePaths([]);
        switchProc(false);
        uploadImage("");
      }
    },[props]);
    //
    

    React.useEffect( ()=> {
      fetchData(props.user, props.authorize);
      console.log("base");
    },[props, isRefreshed]);
    //
    /*
    React.useEffect( ()=> {
      async function fetchData(user, authorize) {
        if  (authorize) {
          console.log("1");
          let files = await getFiles({user: user});
          fetchImages(files.response);
        }
      }
      fetchData(props.user, props.authorize);
      console.log("base");
    },[props]);*/
    
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
                {(isProcessed) ? <CardImageSkeleton/> : <></>}
                {(!isProcessed && image != "") ? <div><CardImage image={image}/>
                <ThemeProvider theme={btnTheme}>
                  <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap flexWrap="wrap">
                    <Button variant="contained" color='accept' onClick={handleAcceptClick}>Accept</Button>
                    <Button variant="contained" color='clear' onClick={handleClearClick}>Clear</Button>
                  </Stack>
                </ThemeProvider>
                </div> : <></>}
            </Item>
            <Item>
              <MasonryImageList itemData={images} handler={fetchData}/>
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

    const {
      getRootProps,
      getInputProps,
      isFocused,
      isDragAccept,
      isDragReject
    } = useDropzone({accept: {'image/*': []}, onDrop});  
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
        <img key={path} src={path} />))
       }
      </div>
    );
  }

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));


export default function PersistentDrawerLeft(props) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [numberPage, changePage] = React.useState(1);
  const [isClear, Refresh] = React.useState(false);
  const [user, fetchUser] = React.useState({name: "", picture:null, authorize: false});
  const location = useLocation();
  console.log(location.state);
  console.log(isClear);
  React.useEffect(()=>{
    console.log("base");
    if  ((!user.authorize) && (location.state) && (!isClear)) {
      console.log("1");
      fetchUser({name: location.state.user,
        picture:location.state.picture,
       authorize: true});
    }

    if (location.state !== null) {
      console.log("2");
      location.state = null
    }

    if (isClear) {
      console.log("3");
      fetchUser({name: "", picture:null, authorize: false});  
    }


  },[isClear, location.state]);

  console.log("user=", user);
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleLogout = async (event) => {
    event.preventDefault();   
    await GetLogout();
    console.log("Logout!!!")
    //
    fetchUser({name: "", picture:null, authorize: false});  

    //Refresh(true);
    //location.state={}
  }
  console.log("Checkpoint!!!")
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Menu
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
            <ListItem key="Login" disablePadding>
            <Link to="/login">
              <ListItemButton>
                <ListItemText primary="Login" />
              </ListItemButton>
            </Link>
            </ListItem>
            <ListItem key="Logout" disablePadding>
              <ListItemButton>
                <ListItemText primary="Logout" onClick={handleLogout} />
              </ListItemButton>
            </ListItem>
            <ListItem key="Image" disablePadding>
              <ListItemButton>
                <ListItemText primary="Image" onClick={()=>{changePage(1)}} />
              </ListItemButton>
            </ListItem>
            <ListItem key="Audio" disablePadding>
              <ListItemButton>
                <ListItemText primary="Audio" onClick={()=>{changePage(2)}} />
              </ListItemButton>
            </ListItem>
            <ListItem key="Time-Series" disablePadding>
              <ListItemButton>
                <ListItemText primary="TS" onClick={()=>{changePage(3)}} />
              </ListItemButton>
            </ListItem>
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        {numberPage === 1 ? 
          <Content user={user.name} picture={user.picture} authorize={user.authorize} clear={isClear}></Content> :
          <></>
        }
        {numberPage === 2 ? 
          <Audio user={user.name} picture={user.picture} authorize={user.authorize} clear={isClear}></Audio> :
          <></>
        }
        {numberPage === 3 ? 
          <TS user={user.name} picture={user.picture} authorize={user.authorize} clear={isClear}></TS> :
          <></>
        }
      </Main>
    </Box>
  );
}