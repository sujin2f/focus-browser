import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Bookmarks from './scenes/Bookmarks';
import Main from './scenes/Main';
import Wrapper from './scenes/Wrapper';
import './App.css';

export default function App() {
    return (
        <Router>
            <Wrapper>
                <Routes>
                    <Route path="/" element={<Main />} />
                    <Route path="/address" element={<Main addressBar />} />
                    <Route path="/bookmarks" element={<Bookmarks />} />
                </Routes>
            </Wrapper>
        </Router>
    );
}
