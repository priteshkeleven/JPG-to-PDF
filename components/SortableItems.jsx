
import {useSortable} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableItem({ id, src, onRemove, name }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2px',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        backgroundColor: '#f9f9f9',
    };

    return (
        <div>
            <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
                <img
                    src={src}
                    alt={`Image ${id}`}
                    style={{height: '100px', marginRight: '10px'}}
                />

            </div>
            <p>{name}</p>
            <button
                onClick={() => onRemove(id)}
                style={{
                    backgroundColor: '#ff4d4d',
                    color: '#fff',
                    border: 'none',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    borderRadius: '5px',
                }}
            >
                Remove
            </button>
        </div>
    );
}
