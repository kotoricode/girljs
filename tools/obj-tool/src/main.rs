use std::fs;
use std::io::Result;
use std::io::Write;

const VERTEX: &str = "v";
const UV: &str = "vt";
const FACE: &str = "f";

fn main() -> Result<()>
{   
    for in_file in fs::read_dir("obj")?
    {
        let mut vertices = Vec::new();
        let mut uvs = Vec::new();
        let mut out_verts = Vec::new();
        let mut out_uvs = Vec::new();

        out_verts.push("[");
        out_uvs.push("[");

        let contents = fs::read_to_string(in_file?.path())?;
        let lines = contents.lines();

        for line in lines
        {
            let parts = line.split_whitespace().collect::<Vec<&str>>();
            let line_type = parts[0];

            if line_type == VERTEX
            {
                vertices.push([
                    parts[1], parts[2], parts[3]
                ]);
            }
            else if line_type == UV
            {
                uvs.push([
                    parts[1], parts[2]
                ]);
            }
            else if line_type == FACE
            {
                for i in 1..4
                {
                    let vert_uv = parts[i].split("/").collect::<Vec<&str>>();

                    let vert_idx = vert_uv[0].parse::<usize>().unwrap() - 1;
                    let uv_idx = vert_uv[1].parse::<usize>().unwrap() - 1;

                    let vert = vertices[vert_idx];
                    let uv = uvs[uv_idx];

                    for j in 0..3
                    {
                        out_verts.push(vert[j]);
                        out_verts.push(", ");
                    }

                    for j in 0..2
                    {
                        out_uvs.push(uv[j]);
                        out_uvs.push(", ");
                    }
                }
            }
        }

        out_verts.push("]\n\n");
        out_uvs.push("]");

        let mut out_file = fs::File::create("test.txt")?;

        for s in &out_verts
        {
            out_file.write(s.as_bytes())?;
        }
        
        for s in &out_uvs
        {
            out_file.write(s.as_bytes())?;
        }
    }

    Ok(())
}
