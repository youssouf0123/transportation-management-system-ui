Use the helper script from the project root:

```bash
bash scripts/export-ipa.sh
```

Optional:

```bash
bash scripts/export-ipa.sh "/full/path/to/App.xcarchive" "/full/path/to/output-folder"
```

It exports with `method=development`, which is appropriate for local device testing after signing is already working in Xcode.
