import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Plot from 'react-plotly.js';

import { CardActionArea } from '@mui/material';

import IconButton from '@mui/material/IconButton';

import Skeleton from '@mui/material/Skeleton';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import { v4 as uuidv4 } from 'uuid';

import {useDropzone} from 'react-dropzone';
import { craftTS } from './handlers';
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

  

  function CardSkeleton() {
    return (<Card sx={{ maxWidth: 250}}>
      <CardActionArea>
        <Skeleton />
        <Skeleton height="100%" />
          
      </CardActionArea>
    </Card>)
    
  };

  export default function TS(props) {
    const [message, updateMessage] = React.useState("");
    const [paths, updatePaths] = React.useState([]);
    const [isProcessed, switchProc] = React.useState(false);
    const [isRefreshed, switchRefresh] = React.useState(false);
    const [data, uploadData] = React.useState({});

    const handleClick = async () => {
      console.log("current message is ", message, "and path=",paths);
      switchProc(true);
      //updateMessage("");
      if (paths.length === 0) {
        return;
      } else {
        var predictor, target
        let splitted = message.split(",");
        if (splitted.length < 2) {
          switchProc(false);
          return;
        }
        for (let index in splitted) {
          if (splitted[index].split('=').length < 2) {
            switchProc(false);
            return;
          }
          if (splitted[index].split('=')[0] === "predictor") {
              predictor=splitted[index].split('=')[1];
              continue;
          }
          if (splitted[index].split('=')[0] === "target") {
            target=splitted[index].split('=')[1];
            continue;
          }
          switchProc(false);
          return;
        }
        await craftTS({file: paths[0], predictor:predictor, target: target}).then(result => {
          //console.log("result os", result);
          if (!result.err) {
            uploadData(result.response);
            switchProc(false);
          }
        }).finally(()=>switchProc(false))
     }
    }
    const dataTrace = React.useMemo(() => {
      const trace = [];
      trace.push({
            y: data.values,
            x: data.datas,
            type: 'scatter',
            name: "origin data",
          });
      trace.push({
            y: data.predictions,
            x: data.futures,
            type: 'scatter',
            name: "predicted data",
          });
        
      return (trace)
    },
      [data]
    );
  
    React.useEffect(()=> {
      if (!props.authorize) {
        updateMessage("");
        updatePaths([]);
        switchProc(false);
        uploadData({});
      }
    },[props]);
    //
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
                {(isProcessed) ? <CardSkeleton/> : <></>}
                {(!isProcessed && data.datas) ? 
                <div>
                  <ThemeProvider theme={btnTheme}>
                  <Plot
                    data={dataTrace}
                    layout={{
                    title: 'Concentration Plot Box',
                    autosize: true,
                    yaxis: {
                    title: {
                      text: 'Time'}}
                    }}
                    useResizeHandler={true}
                    style={{ width: "100%", height: "100%" }}
                  />
                  <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap>
                      <Button variant="contained" color='accept' >Accept</Button>
                      <Button variant="contained" color='clear' >Clear</Button>
                  </Stack>
                  </ThemeProvider>
                </div> : <></>}
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
    } = useDropzone({accept: {'plain/text': ['.csv']}, onDrop});  
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
        <h6>{path}</h6> ))
       }
       {paths.length > 0 && <button onClick={removeAll}>Remove All</button>}
      </div>
    );
  }

