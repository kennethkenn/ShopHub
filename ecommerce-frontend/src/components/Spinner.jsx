import './Spinner.css';

function Spinner({ size = 'medium', fullPage = false }) {
    const content = (
        <div className={`spinner spinner-${size}`}>
            <div className="spinner-circle"></div>
        </div>
    );

    if (fullPage) {
        return (
            <div className="spinner-container">
                {content}
            </div>
        );
    }

    return content;
}

export default Spinner;
