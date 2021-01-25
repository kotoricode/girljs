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
                        let f: f32 = vert[j].parse().unwrap();

                        out_verts.push(f);
                    }

                    for j in 0..2
                    {
                        let f: f32 = uv[j].parse().unwrap();

                        out_uvs.push(f);
                    }
                }
            }
        }

        let mut out_file = fs::File::create("test.blob")?;

        let v_bytes = unsafe {
            std::slice::from_raw_parts(
                out_verts.as_ptr() as *const u8,
                out_verts.len() * 4,
            )
        };

        out_file.write(v_bytes)?;

        let v2_bytes = unsafe {
            std::slice::from_raw_parts(
                out_uvs.as_ptr() as *const u8,
                out_uvs.len() * 4,
            )
        };

        out_file.write(v2_bytes)?;
    }

    Ok(())
}
