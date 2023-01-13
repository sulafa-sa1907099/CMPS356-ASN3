
"use client"
import { useEffect, useState, useTransition } from 'react';
import { useQuery } from "react-query";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import Spinner from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import Chip from '@mui/material/Chip';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Tabs } from "@mui/material";
import { Stack } from '@mui/system';
import { wordsStore } from '../../stores/wordStore';

export default function Words() {
  const searchParams = useSearchParams()
  const query = searchParams.get('query');
  const router = useRouter()

  //state vars
  const [word, setWord] = useState('');
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
 
  //store
  const handleClick = wordsStore((state) => state.handleClick)
  const selectedWords = wordsStore((state) => state.favWords)

  useEffect(() => {
    if (!query) return;
    setWord(query)
    setSearch(query)
  }, [])

  useEffect(() => {
    if (word == undefined || word == query) return
    else router.push(`/words?query=${word}`)
  }, [word])

  const handleChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    startTransition(() => { setWord(value) })
  };

  const handleClear = () => {
    setSearch("");
    startTransition(() => { setWord("") })

  };

  //FETCHING
  const wordsFetcher = () =>
    fetch(`https://api.datamuse.com/words?ml=${word}`).then((res) => res.json());

  const words = useQuery(["words", word], wordsFetcher);

  const sugFetcher = () =>
    fetch(`https://api.datamuse.com/sug?s=${word}`).then((res) => res.json());

  const sug = useQuery(["sugs", word], sugFetcher);


  useEffect(() => {
    console.log(words.isFetching)
  }, [words.isFetching])

  useEffect(() => {
    console.log(selectedWords)
  }, [words])


  return (
    <>

      <Box sx={{ height: "100%", margin: 8 }}>
        <Stack flexDirection="row">
          <TextField
            label="Search"
            sx={{ minWidth: '25ch', width: '30ch', backgroundColor: isPending && "#E0E0E0" }}
            value={search}
            InputProps={{
              startAdornment: <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>,
              endAdornment:
                <InputAdornment position="end">
                  {isPending ? <Spinner size="25px"/> :
                    <IconButton
                      aria-label="clear"
                      onClick={handleClear}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>}

                </InputAdornment>

            }}
            onChange={handleChange}
          />
          <Tabs
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            value={false}

          >
            {sug.isFetching ? <Spinner size="35px" /> :

              sug?.data?.map(s => <Chip sx={{ m: 2 }} onClick={() => { setWord(s.word); setSearch(s.word) }} label={s.word} variant="outlined" />)}
          </Tabs>
        </Stack>
        <Box>
          <Tabs
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            value={false}
          >
            {selectedWords?.map(word => <Chip onDelete={() => handleClick(word)} onClick={() => { setWord(word); setSearch(word) }} label={word} variant="outlined" size="50px" sx={{ m: 2 }} color="primary" />)}
          </Tabs>
        </Box>

        <Box sx={{ height: 450, mt: 2 }}>
          {words.isFetching ? <Spinner size="70px" sx={{ m: 2 }} /> :
            <TableContainer sx={{ display: !word && 'none' }}>
              <Table sx={{ minWidth: "80%" }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell ><h3>Word</h3></TableCell>
                    <TableCell ><h3>Score</h3></TableCell>
                    <TableCell align='center'><h3>Tags</h3></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {words?.data.map((result) => (
                    <TableRow
                      key={result.word}
                      onClick={() => handleClick(result.word)}
                      hover='true'
                      selected={selectedWords.find(word => word == result.word) && "true"}
                    >
                      <TableCell component="th" scope="row">
                        {result.word}
                      </TableCell>
                      <TableCell >{result.score}</TableCell>
                      <TableCell align='center'>{
                        result.tags?.map(tag =>
                          <Chip label={tag} variant="outlined" sx={{ m: 1, color: (tag.includes("primary_rel")) && "green" }} />)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

          }
        </Box>

      </Box>

    </>
  );
}

